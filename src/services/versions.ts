import { v4 as uuid } from 'uuid'
import { db } from '../db'
import type { WritingDocument, Version } from '../types'

const SNAPSHOT_GAP_MS = 60_000
export async function snapshot(doc: WritingDocument, reason: Version['reason'], force = false) {
  const latest = await db.versions.where('documentId').equals(doc.id).reverse().sortBy('timestamp').then(a => a[0])
  if (!force && latest && latest.content === doc.content) return
  if (!force && latest && Date.now() - Date.parse(latest.timestamp) < SNAPSHOT_GAP_MS) return
  await db.versions.add({ id: uuid(), documentId: doc.id, timestamp: new Date().toISOString(), content: doc.content, title: doc.title, reason, syncState: 'pending' })
}
export const versionsFor = (documentId: string) => db.versions.where('documentId').equals(documentId).reverse().sortBy('timestamp')
