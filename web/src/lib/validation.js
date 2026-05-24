// Ported from C# QA logic — thresholds match exactly
export const THRESHOLDS = {
  MAX_TEMP_CELSIUS: 6.0,
  MIN_FAT_PERCENTAGE: 3.5,
  MIN_VOLUME_LITERS: 1000.0,
}

export const BatchStatus = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  QUALITY_REJECTED: 'QualityRejected',
  QUARANTINED: 'Quarantined',
}

export const BatchType = {
  STANDARD: 'Standard',
  ORGANIC: 'Organic',
}

export const EventType = {
  APPROVED: 'APPROVED',
  QUALITY_REJECTED: 'QUALITY_REJECTED',
  SAFETY_BREACH: 'SAFETY_BREACH',
}

// Strategy 1 — Temperature (CRITICAL: triggers Quarantine)
function validateTemperature(batch) {
  if (batch.temperature > THRESHOLDS.MAX_TEMP_CELSIUS) {
    return {
      isValid: false,
      isCritical: true,
      message: `Temperature ${batch.temperature}°C exceeds safe cold-chain limit of ${THRESHOLDS.MAX_TEMP_CELSIUS}°C`,
    }
  }
  return { isValid: true, isCritical: true, message: 'Temperature within safe range' }
}

// Strategy 2 — Fat content (soft: triggers QualityRejected)
function validateFatContent(batch) {
  if (batch.fatPercentage < THRESHOLDS.MIN_FAT_PERCENTAGE) {
    return {
      isValid: false,
      isCritical: false,
      message: `Fat content ${batch.fatPercentage}% is below minimum ${THRESHOLDS.MIN_FAT_PERCENTAGE}%`,
    }
  }
  return { isValid: true, isCritical: false, message: 'Fat content meets standards' }
}

// Strategy 3 — Volume (soft: triggers QualityRejected)
function validateVolume(batch) {
  if (batch.volumeLiters < THRESHOLDS.MIN_VOLUME_LITERS) {
    return {
      isValid: false,
      isCritical: false,
      message: `Volume ${batch.volumeLiters}L is below minimum ${THRESHOLDS.MIN_VOLUME_LITERS}L`,
    }
  }
  return { isValid: true, isCritical: false, message: 'Volume meets minimum threshold' }
}

// Main QA processing — mirrors QualityAssuranceService.ProcessBatch()
export function processBatch(batch) {
  const strategies = [validateTemperature, validateFatContent, validateVolume]

  for (const strategy of strategies) {
    const result = strategy(batch)
    if (!result.isValid) {
      if (result.isCritical) {
        return {
          status: BatchStatus.QUARANTINED,
          eventType: EventType.SAFETY_BREACH,
          message: result.message,
        }
      } else {
        return {
          status: BatchStatus.QUALITY_REJECTED,
          eventType: EventType.QUALITY_REJECTED,
          message: result.message,
        }
      }
    }
  }

  return {
    status: BatchStatus.APPROVED,
    eventType: EventType.APPROVED,
    message: 'Batch passed all quality checks — approved for processing',
  }
}
