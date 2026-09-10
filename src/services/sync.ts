import { db, getSetting, setSetting } from '../db'
import { downloadJson, ensureRoots, isConnected, listAppFiles, saveBlob, saveJson } from './google'
import type { DriveRoots, WritingDocument } from '../types'

const ROOTS_KEY = 'driveRoots'
const MANIFEST = 'workspace.json'
async function roots() { const known = await getSetting(ROOTS_KEY); if (known) return JSON.parse(known) as DriveRoots; const r = await ensureRoots(); await setSetting(ROOTS_KEY, JSON.stringify(r)); return r }
const docFolder = (d: WritingDocument, r: DriveRoots) => d.type === 'journal' ? r.journal : r.stories
export async function syncAll(onStatus?: (message: string) => void) {
  if (!navigator.onLine) { onStatus?.('Offline — changes are safely saved on this device'); return }
  if (!isConnected()) { onStatus?.('Sign in to sync with Google Drive'); return }
  try {
    onStatus?.('Checking Google Drive…'); const r = await roots(); const files = await listAppFiles(r.appData); const remoteManifest = files.files.find((f: { name: string }) => f.name === MANIFEST)
    if (remoteManifest) await mergeRemote(await downloadJson(remoteManifest.id), onStatus)
    const pending = await db.documents.filter(d => d.syncState !== 'synced' || !d.driveFileId).toArray()
    for (const doc of pending) {
      if (doc.deletedAt) { await db.documents.update(doc.id, { syncState: 'synced' }); continue }
      const result = await saveJson(`${doc.id}.json`, doc, docFolder(doc, r), doc.driveFileId)
      await db.documents.update(doc.id, { driveFileId: result.id, driveModifiedTime: result.modifiedTime, syncState: 'synced' })
    }
    for (const version of await db.versions.filter(v => v.syncState !== 'synced').toArray()) { const saved = await saveJson(`${version.documentId}-${version.id}.json`, version, r.versions, version.driveFileId); await db.versions.update(version.id, { driveFileId: saved.id, syncState: 'synced' }) }
    for (const attachment of await db.attachments.filter(a => a.syncState !== 'synced').toArray()) { const saved = await saveBlob(`${attachment.id}-${attachment.name}`, attachment.blob, r.attachments, attachment.driveFileId); await db.attachments.update(attachment.id, { driveFileId: saved.id, syncState: 'synced' }) }
    const all = await db.documents.toArray(); const manifest = { schemaVersion: 1, updatedAt: new Date().toISOString(), documents: all.map(({ content, plainText, ...meta }) => meta) }
    await saveJson(MANIFEST, manifest, r.appData, remoteManifest?.id); onStatus?.('Synced with Google Drive')
  } catch (error) { onStatus?.(`Sync paused: ${(error as Error).message}. Local work is safe.`); await db.documents.filter(d => d.syncState === 'pending').modify({ syncState: 'error' }) }
}
async function mergeRemote(remote: { documents?: WritingDocument[] }, onStatus?: (s: string) => void) {
  for (const cloud of remote.documents || []) {
    const local = await db.documents.get(cloud.id)
    if (!local) { const full = cloud.driveFileId ? await downloadJson(cloud.driveFileId) : cloud; await db.documents.put({ ...full, syncState: 'synced' }); continue }
    if (local.syncState === 'synced' && Date.parse(cloud.updatedAt) > Date.parse(local.updatedAt)) { const full = cloud.driveFileId ? await downloadJson(cloud.driveFileId) : cloud; await db.documents.put({ ...full, syncState: 'synced' }); continue }
    if (local.syncState !== 'synced' && Date.parse(cloud.updatedAt) > Date.parse(local.updatedAt)) {
      const copy: WritingDocument = { ...local, id: crypto.randomUUID(), title: `${local.title} (conflict copy)`, conflictOf: cloud.id, syncState: 'conflict', updatedAt: new Date().toISOString() }
      await db.documents.put(copy); onStatus?.('A conflict was preserved as a separate copy.')
    }
  }
}
