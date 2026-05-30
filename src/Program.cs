using System;
using System.Collections.Generic;
using System.Linq;

namespace FonterraPūnahaSystem
{
    // Custom Exception: Critical for modeling real-world "Stop Work" events in dairy logistics
    public class SafetyThresholdException : Exception 
    {
        public SafetyThresholdException(string message) : base(message) { }
    }

    // Task 2 (NFR1): Advanced Interface ensuring all assets are trackable
    public interface ITraceable
    {
        string BatchId { get; }
        DateTime CollectionTime { get; }
        void PrintTraceabilityReport();
    }

    public enum BatchStatus { Pending, Approved, QualityRejected, Quarantined }

    public class MilkBatch : ITraceable
    {
        public string BatchId { get; }
        public string FarmSource { get; set; }
        public double VolumeLiters { get; set; }
        public double Temperature { get; set; }
        public double FatPercentage { get; set; }
        public DateTime CollectionTime { get; }

        public BatchStatus Status { get; private set; } = BatchStatus.Pending;

        public void Approve()     => Status = BatchStatus.Approved;
        public void Reject()      => Status = BatchStatus.QualityRejected;
        public void Quarantine()  => Status = BatchStatus.Quarantined;

        // keeps LINQ summary unchanged
        public bool IsQualityApproved => Status == BatchStatus.Approved;

        public MilkBatch(string id, string farm, double volume, double temp, double fat)
        {
            BatchId = id;
            FarmSource = farm;
            VolumeLiters = volume;
            Temperature = temp;
            FatPercentage = fat;
            CollectionTime = DateTime.Now;
        }

        public void PrintTraceabilityReport()
        {
            Console.WriteLine($"[TRACE] {CollectionTime:HH:mm} | ID: {BatchId} | Temp: {Temperature}°C | Status: {Status}");
        }
    }

    // Task 6 — Strategy Pattern: common contract for all validation rules
    public class ValidationResult
    {
        public bool IsValid { get; }
        public bool IsCritical { get; }
        public string Message { get; }
        public ValidationResult(bool isValid, bool isCritical, string message)
        {
            IsValid = isValid; IsCritical = isCritical; Message = message;
        }
    }

    public interface IBatchRule
    {
        ValidationResult Validate(MilkBatch batch);
    }

    // isCritical: false — fat failures downgrade the batch, they don't quarantine it
    public class FatContentRule : IBatchRule
    {
        public ValidationResult Validate(MilkBatch batch)
        {
            if (batch.FatPercentage < 3.5)
                return new ValidationResult(false, false,
                    $"Fat content {batch.FatPercentage}% is below minimum 3.5%");
            return new ValidationResult(true, false, "Fat content meets standards");
        }
    }

    public class VolumeRule : IBatchRule
    {
        public ValidationResult Validate(MilkBatch batch)
        {
            if (batch.VolumeLiters < 1000.0)
                return new ValidationResult(false, false,
                    $"Volume {batch.VolumeLiters}L is below minimum 1000L");
            return new ValidationResult(true, false, "Volume meets minimum threshold");
        }
    }

    // Task 6 — Observer Pattern: event bus for batch lifecycle notifications
    public enum BatchEventType { Approved, QualityRejected, SafetyBreach }

    public class BatchEvent
    {
        public MilkBatch Batch { get; }
        public BatchEventType Type { get; }
        public string Message { get; }
        public BatchEvent(MilkBatch batch, BatchEventType type, string message)
        {
            Batch = batch; Type = type; Message = message;
        }
    }

    public interface IBatchObserver
    {
        void OnBatchProcessed(BatchEvent e);
    }

    // Only reacts to SafetyBreach — early return lets it ignore everything else
    public class QuarantineAlertObserver : IBatchObserver
    {
        public void OnBatchProcessed(BatchEvent e)
        {
            if (e.Type != BatchEventType.SafetyBreach) return;
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"  🚨  QUARANTINE ALERT: {e.Batch.BatchId} — {e.Message}");
            Console.ResetColor();
        }
    }

    // Logic Class: Simulates the Quality Assurance Dept (Task 2, 3 & 6)
    public class QualityAssuranceService
    {
        private const double MaxTempCelsius = 6.0;
        private readonly List<IBatchRule> _rules = new() { new FatContentRule(), new VolumeRule() };
        private readonly List<IBatchObserver> _observers = new();

        public void AddObserver(IBatchObserver observer) => _observers.Add(observer);

        private void Notify(BatchEvent e)
        {
            foreach (var obs in _observers) obs.OnBatchProcessed(e);
        }

        public void ProcessBatch(MilkBatch batch)
        {
            if (batch.Temperature > MaxTempCelsius)
            {
                batch.Quarantine();
                Notify(new BatchEvent(batch, BatchEventType.SafetyBreach,
                    $"Temperature {batch.Temperature}°C exceeds safety limit!"));
                throw new SafetyThresholdException($"CRITICAL: Temperature {batch.Temperature}°C exceeds safety limit!");
            }

            foreach (var rule in _rules)
            {
                var result = rule.Validate(batch);
                if (!result.IsValid)
                {
                    batch.Reject();
                    Console.WriteLine($"DOWNGRADED: Batch {batch.BatchId} — {result.Message}");
                    Notify(new BatchEvent(batch, BatchEventType.QualityRejected, result.Message));
                    return;
                }
            }

            batch.Approve();
            Console.WriteLine($"SUCCESS: Batch {batch.BatchId} approved for processing.");
            Notify(new BatchEvent(batch, BatchEventType.Approved, $"Batch {batch.BatchId} approved."));
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("--- Fonterra Digital Value Chain (Project Pūnaha) ---");

            // Advanced Collection Management: Simulating daily logistics data
            List<MilkBatch> dailyCollections = new List<MilkBatch>
            {
                new MilkBatch("B-001", "Waikato-01", 5200, 4.2, 3.8),
                new MilkBatch("B-002", "Taranaki-05", 3100, 4.5, 3.2), // Low quality
                new MilkBatch("B-003", "Canterbury-02", 8000, 9.2, 4.0) // Safety failure
            };

            var qaService = new QualityAssuranceService();
            qaService.AddObserver(new QuarantineAlertObserver());

            foreach (var batch in dailyCollections)
            {
                try { qaService.ProcessBatch(batch); }
                catch (SafetyThresholdException ex) { Console.ForegroundColor = ConsoleColor.Red; Console.WriteLine(ex.Message); Console.ResetColor(); }
            }

            // Task 4: Advanced Data Analysis using LINQ
            Console.WriteLine("\n--- DAILY SUMMARY REPORT ---");
            Console.WriteLine($"Approved Batches: {dailyCollections.Count(b => b.IsQualityApproved)}");
            Console.WriteLine($"Total Volume: {dailyCollections.Where(b => b.IsQualityApproved).Sum(b => b.VolumeLiters)}L");
            
            Console.WriteLine("\n--- TRACEABILITY AUDIT LOG ---");
            dailyCollections.ForEach(b => b.PrintTraceabilityReport());
        }
    }
}