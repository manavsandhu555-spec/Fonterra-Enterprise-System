using System;
using System.Collections.Generic;

namespace FonterraPūnahaSystem
{
    // Interface to ensure traceability as per Task 2 (NFR1)
    public interface ITraceable
    {
        string GetTraceabilityLog();
    }

    // Domain Class representing a batch of milk collected from a farm
    public class MilkBatch : ITraceable
    {
        public string BatchId { get; set; }
        public string FarmSource { get; set; }
        public double VolumeLiters { get; set; }
        public double Temperature { get; set; }
        public bool IsQualityApproved { get; private set; }

        public MilkBatch(string id, string farm, double volume, double temp)
        {
            BatchId = id;
            FarmSource = farm;
            VolumeLiters = volume;
            Temperature = temp;
            IsQualityApproved = false;
        }

        public void SetQualityStatus(bool status)
        {
            IsQualityApproved = status;
        }

        public string GetTraceabilityLog()
        {
            return $"[TRACE] Batch {BatchId} from {FarmSource}: {VolumeLiters}L at {Temperature}°C. Approved: {IsQualityApproved}";
        }
    }

    // Logic for the Quality Assurance Department
    public class QualityAssuranceDept
    {
        public bool ValidateBatch(MilkBatch batch)
        {
            // Business Rule: Milk must be below 6°C for safety (as per Fonterra standards)
            if (batch.Temperature < 6.0)
            {
                batch.SetQualityStatus(true);
                return true;
            }
            return false;
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("--- Fonterra Digital Value Chain (Project Pūnaha) ---");

            // 1. Simulate Collection (On-Farm Operations)
            MilkBatch currentBatch = new MilkBatch("BATCH-2024-001", "Waikato-Farm-88", 5500.5, 4.2);

            // 2. Process through QA Department
            QualityAssuranceDept qa = new QualityAssuranceDept();
            bool result = qa.ValidateBatch(currentBatch);

            // 3. Output results (Supply Chain / Logistics)
            if (result)
            {
                Console.WriteLine("SUCCESS: Batch validated for processing.");
            }
            else
            {
                Console.WriteLine("ALERT: Batch rejected due to temperature safety violation.");
            }

            Console.WriteLine(currentBatch.GetTraceabilityLog());
            Console.WriteLine("---------------------------------------------------");
        }
    }
}