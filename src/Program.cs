using System;
using System.Collections.Generic;
using System.Linq;

namespace FonterraPūnahaSystem
{
    // ─── Exceptions ──────────────────────────────────────────────────────────────

    public class SafetyThresholdException : Exception
    {
        public SafetyThresholdException(string message) : base(message) { }
    }

    // ─── Threshold Configuration (single source of truth for all rules) ──────────

    public static class ThresholdConfiguration
    {
        public const double MaxTemperatureCelsius = 6.0;
        public const double MinFatPercentage      = 3.5;
        public const double MinVolumeLiters       = 1000.0;
    }

    // ─── Domain Interfaces ────────────────────────────────────────────────────────

    // Task 2 (NFR1): ensures all trackable assets expose a standard audit surface
    public interface ITraceable
    {
        string BatchId { get; }
        DateTime CollectionTime { get; }
        void PrintTraceabilityReport();
    }

    // Task 6 — Strategy Pattern contract
    public interface IValidationRule
    {
        ValidationResult Validate(MilkBatch batch);
    }

    // Task 6 — Observer Pattern contract
    public interface IBatchObserver
    {
        void OnBatchProcessed(BatchEvent e);
    }

    // ─── Value Objects ────────────────────────────────────────────────────────────

    public class ValidationResult
    {
        public bool   IsValid    { get; }
        public bool   IsCritical { get; }
        public string Message    { get; }

        public ValidationResult(bool isValid, bool isCritical, string message)
        {
            IsValid = isValid; IsCritical = isCritical; Message = message;
        }
    }

    public enum BatchEventType { Approved, QualityRejected, SafetyBreach }

    public class BatchEvent
    {
        public MilkBatch     Batch   { get; }
        public BatchEventType Type   { get; }
        public string         Message { get; }

        public BatchEvent(MilkBatch batch, BatchEventType type, string message)
        {
            Batch = batch; Type = type; Message = message;
        }
    }

    // ─── Domain Entity ────────────────────────────────────────────────────────────

    public enum BatchStatus { Pending, Approved, QualityRejected, Quarantined }

    public class MilkBatch : ITraceable
    {
        public string   BatchId      { get; }
        public string   FarmSource   { get; set; }
        public double   VolumeLiters { get; set; }
        public double   Temperature  { get; set; }
        public double   FatPercentage { get; set; }
        public DateTime CollectionTime { get; }

        // State machine — transitions are explicit methods, not arbitrary bool flags
        public BatchStatus Status { get; private set; } = BatchStatus.Pending;

        public void Approve()    => Status = BatchStatus.Approved;
        public void Reject()     => Status = BatchStatus.QualityRejected;
        public void Quarantine() => Status = BatchStatus.Quarantined;

        // Computed property — LINQ summary queries remain unchanged
        public bool IsQualityApproved => Status == BatchStatus.Approved;

        public MilkBatch(string id, string farm, double volume, double temp, double fat)
        {
            BatchId        = id;
            FarmSource     = farm;
            VolumeLiters   = volume;
            Temperature    = temp;
            FatPercentage  = fat;
            CollectionTime = DateTime.Now;
        }

        public void PrintTraceabilityReport()
        {
            Console.WriteLine(
                $"[TRACE] {CollectionTime:HH:mm:ss} | {BatchId,-10} | " +
                $"Farm: {FarmSource,-15} | Temp: {Temperature,4}°C | " +
                $"Fat: {FatPercentage,4}% | Vol: {VolumeLiters,6}L | Status: {Status}");
        }
    }

    // ─── Strategy Pattern — Concrete Rules ───────────────────────────────────────

    // IsCritical: true — temperature breach quarantines the batch immediately
    public class TemperatureRule : IValidationRule
    {
        public ValidationResult Validate(MilkBatch batch)
        {
            if (batch.Temperature > ThresholdConfiguration.MaxTemperatureCelsius)
                return new ValidationResult(false, true,
                    $"Temperature {batch.Temperature}°C exceeds cold-chain limit of " +
                    $"{ThresholdConfiguration.MaxTemperatureCelsius}°C");
            return new ValidationResult(true, true, "Temperature within safe cold-chain range");
        }
    }

    // IsCritical: false — fat failures downgrade the batch, they don't quarantine it
    public class FatContentRule : IValidationRule
    {
        public ValidationResult Validate(MilkBatch batch)
        {
            if (batch.FatPercentage < ThresholdConfiguration.MinFatPercentage)
                return new ValidationResult(false, false,
                    $"Fat content {batch.FatPercentage}% is below minimum " +
                    $"{ThresholdConfiguration.MinFatPercentage}%");
            return new ValidationResult(true, false, "Fat content meets standards");
        }
    }

    // IsCritical: false — low volume is a soft quality issue, not a safety breach
    public class VolumeRule : IValidationRule
    {
        public ValidationResult Validate(MilkBatch batch)
        {
            if (batch.VolumeLiters < ThresholdConfiguration.MinVolumeLiters)
                return new ValidationResult(false, false,
                    $"Volume {batch.VolumeLiters}L is below minimum " +
                    $"{ThresholdConfiguration.MinVolumeLiters}L");
            return new ValidationResult(true, false, "Volume meets minimum threshold");
        }
    }

    // ─── Observer Pattern — Concrete Observers ───────────────────────────────────

    // Logs every batch event to an in-memory audit trail
    public class AuditLogObserver : IBatchObserver
    {
        private readonly List<string> _entries = [];

        public void OnBatchProcessed(BatchEvent e)
        {
            string entry =
                $"[AUDIT] {DateTime.Now:HH:mm:ss} | {e.Batch.BatchId} | " +
                $"{e.Type,-15} | {e.Message}";
            _entries.Add(entry);
            Console.WriteLine(entry);
        }

        public void PrintFullLog()
        {
            Console.WriteLine("\n--- FULL AUDIT TRAIL ---");
            if (_entries.Count == 0) { Console.WriteLine("  (no entries)"); return; }
            _entries.ForEach(Console.WriteLine);
        }
    }

    // Only reacts to SafetyBreach — early return silently ignores every other event
    public class QuarantineAlertObserver : IBatchObserver
    {
        public void OnBatchProcessed(BatchEvent e)
        {
            if (e.Type != BatchEventType.SafetyBreach) return;
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"  🚨  QUARANTINE ALERT: {e.Batch.BatchId} | Farm: {e.Batch.FarmSource} | {e.Message}");
            Console.ResetColor();
        }
    }

    // ─── Quality Assurance Service (Subject + Context) ───────────────────────────

    public class QualityAssuranceService
    {
        // Strategy list — ordered; TemperatureRule runs first (critical check)
        private readonly List<IValidationRule> _rules = new()
        {
            new TemperatureRule(),
            new FatContentRule(),
            new VolumeRule()
        };

        private readonly List<IBatchObserver> _observers = new();

        public void Subscribe(IBatchObserver observer) => _observers.Add(observer);

        private void Notify(BatchEvent e)
        {
            foreach (var obs in _observers) obs.OnBatchProcessed(e);
        }

        public void ProcessBatch(MilkBatch batch)
        {
            foreach (var rule in _rules)
            {
                var result = rule.Validate(batch);
                if (!result.IsValid)
                {
                    if (result.IsCritical)
                    {
                        batch.Quarantine();
                        Notify(new BatchEvent(batch, BatchEventType.SafetyBreach, result.Message));
                        throw new SafetyThresholdException($"CRITICAL: {result.Message}");
                    }
                    else
                    {
                        batch.Reject();
                        Console.WriteLine($"DOWNGRADED: Batch {batch.BatchId} — {result.Message}");
                        Notify(new BatchEvent(batch, BatchEventType.QualityRejected, result.Message));
                        return;
                    }
                }
            }

            batch.Approve();
            Console.WriteLine($"SUCCESS: Batch {batch.BatchId} approved for processing.");
            Notify(new BatchEvent(batch, BatchEventType.Approved,
                $"All rules passed — batch approved for processing"));
        }
    }

    // ─── Reporting ────────────────────────────────────────────────────────────────

    public static class BatchReport
    {
        public static void PrintSummary(List<MilkBatch> batches)
        {
            int approved   = batches.Count(b => b.Status == BatchStatus.Approved);
            int rejected   = batches.Count(b => b.Status == BatchStatus.QualityRejected);
            int quarantine = batches.Count(b => b.Status == BatchStatus.Quarantined);
            double totalVol = batches.Where(b => b.IsQualityApproved).Sum(b => b.VolumeLiters);

            Console.WriteLine("\n--- DAILY SUMMARY REPORT ---");
            Console.WriteLine($"  Total Batches    : {batches.Count}");
            Console.WriteLine($"  Approved         : {approved}");
            Console.WriteLine($"  Quality Rejected : {rejected}");
            Console.WriteLine($"  Quarantined      : {quarantine}");
            Console.WriteLine($"  Approved Volume  : {totalVol:N0} L");

            if (approved > 0)
            {
                double avgFat = batches
                    .Where(b => b.IsQualityApproved)
                    .Average(b => b.FatPercentage);
                Console.WriteLine($"  Avg Fat (approved): {avgFat:F2}%");
            }
        }
    }

    // ─── Entry Point ──────────────────────────────────────────────────────────────

    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("=== Fonterra Digital Value Chain — Project Pūnaha ===\n");

            List<MilkBatch> dailyCollections = new List<MilkBatch>
            {
                new MilkBatch("B-001", "Waikato-01",    5200, 4.2, 3.8),  // ✓ Should approve
                new MilkBatch("B-002", "Taranaki-05",   3100, 4.5, 3.2),  // ✗ Low fat  → QualityRejected
                new MilkBatch("B-003", "Canterbury-02", 8000, 9.2, 4.0),  // ✗ High temp → Quarantined
                new MilkBatch("B-004", "Southland-07",   800, 3.8, 4.1),  // ✗ Low volume → QualityRejected
                new MilkBatch("B-005", "Waikato-03",    4500, 5.1, 4.5),  // ✓ Should approve
            };

            var auditLog       = new AuditLogObserver();
            var quarantineAlert = new QuarantineAlertObserver();

            var qaService = new QualityAssuranceService();
            qaService.Subscribe(auditLog);
            qaService.Subscribe(quarantineAlert);

            Console.WriteLine("--- Processing Batches ---");
            foreach (var batch in dailyCollections)
            {
                try
                {
                    qaService.ProcessBatch(batch);
                }
                catch (SafetyThresholdException ex)
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine(ex.Message);
                    Console.ResetColor();
                }
            }

            BatchReport.PrintSummary(dailyCollections);

            Console.WriteLine("\n--- TRACEABILITY AUDIT LOG ---");
            dailyCollections.ForEach(b => b.PrintTraceabilityReport());

            auditLog.PrintFullLog();
        }
    }
}
