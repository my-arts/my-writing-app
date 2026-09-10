import Dexie, { type EntityTable } from 'dexie'
import type { WritingDocument, Version, Attachment, AppSetting } from './types'

class WritingDB extends Dexie {
  documents!: EntityTable<WritingDocument, 'id'>
  versions!: EntityTable<Version, 'id'>
  attachments!: EntityTable<Attachment, 'id'>
  settings!: EntityTable<AppSetting, 'key'>
  constructor() { super('my-writing-app'); this.version(1).stores({ documents: 'id,type,parentId,updatedAt,deletedAt,syncState,*plainText', versions: 'id,documentId,timestamp', attachments: 'id,documentId,syncState', settings: 'key' }) }
}
export const db = new WritingDB()
export const getSetting = async (key: string) => (await db.settings.get(key))?.value
export const setSetting = (key: string, value: string) => db.settings.put({ key, value })
