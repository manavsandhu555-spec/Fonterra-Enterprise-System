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

    public class MilkBatch : ITraceable
    {
        public string BatchId { get; }
        public string FarmSource { get; set; }
        public double VolumeLiters { get; set; }
        public double Temperature { get; set; }
        public double FatPercentage { get; set; } // Added: Key financial metric
        public DateTime CollectionTime { get; }
        
        // Encapsulation: Ensures safety status cannot be tampered with arbitrarily
        public bool IsQualityApproved { get; private set; }

        public MilkBatch(string id, string farm, double volume, double temp, double fat)
        {
            BatchId = id;
            FarmSource = farm;
            VolumeLiters = volume;
            Temperature = temp;
            FatPercentage = fat;
            CollectionTime = DateTime.Now;
            IsQualityApproved = false;
        }

        public void Approve() => IsQualityApproved = true;

        public void PrintTraceabilityReport()
        {
            string status = IsQualityApproved ? "PASS" : "PENDING/FAIL";
            Console.WriteLine($"[TRACE] {CollectionTime:HH:mm} | ID: {BatchId} | Temp: {Temperature}°C | Status: {status}");
        }
    }

    // Logic Class: Simulates the Quality Assurance Dept (Task 2 & 3)
    public class QualityAssuranceService
    {
        private const double MaxTempCelsius = 6.0;

        public void ProcessBatch(MilkBatch batch)
        {
            // Business Rule: Safety Check (Exception-based control flow)
            if (batch.Temperature > MaxTempCelsius)
                throw new SafetyThresholdException($"CRITICAL: Temperature {batch.Temperature}°C exceeds safety limit!");

            // Business Rule: Quality Check
            if (batch.FatPercentage >= 3.5)
            {
                batch.Approve();
                Console.WriteLine($"SUCCESS: Batch {batch.BatchId} approved for processing.");
            }
            else
            {
                Console.WriteLine($"REJECTED: Batch {batch.BatchId} quality not met.");
            }
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