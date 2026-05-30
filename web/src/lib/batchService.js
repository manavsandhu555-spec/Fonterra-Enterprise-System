import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { processBatch } from './validation'

const BATCHES_COL = 'batches'
const AUDIT_COL = 'auditLog'

// Subscribe to live batch updates — returns unsubscribe fn
export function subscribeToBatches(callback) {
  const q = query(collection(db, BATCHES_COL), orderBy('collectionTime', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const batches = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    callback(batches)
  })
}

// Subscribe to live audit log updates — returns unsubscribe fn
export function subscribeToAuditLog(callback) {
  const q = query(collection(db, AUDIT_COL), orderBy('timestamp', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    callback(events)
  })
}

// Create a new batch, run QA validation, persist both batch + audit event
export async function submitBatch(formData) {
  const batch = {
    batchId: formData.batchId.trim(),
    farmSource: formData.farmSource.trim(),
    volumeLiters: parseFloat(formData.volumeLiters),
    temperature: parseFloat(formData.temperature),
    fatPercentage: parseFloat(formData.fatPercentage),
    type: formData.type,
    collectionTime: serverTimestamp(),
    status: 'Pending',
  }

  const result = processBatch(batch)
  batch.status = result.status

  const batchRef = await addDoc(collection(db, BATCHES_COL), batch)

  await addDoc(collection(db, AUDIT_COL), {
    batchId: batch.batchId,
    batchDocId: batchRef.id,
    farmSource: batch.farmSource,
    batchType: batch.type,
    eventType: result.eventType,
    message: result.message,
    timestamp: serverTimestamp(),
  })

  return { batchId: batchRef.id, result }
}
