export type DocType = 'journal' | 'book' | 'chapter' | 'section'
export type SyncState = 'synced' | 'pending' | 'offline' | 'error' | 'conflict'
export interface WritingDocument { id: string; type: DocType; title: string; content: string; plainText: string; createdAt: string; updatedAt: string; parentId?: string; order: number; deletedAt?: string; driveFileId?: string; driveModifiedTime?: string; syncState: SyncState; conflictOf?: string }
export interface Version { id: string; documentId: string; timestamp: string; content: string; title: string; reason: 'interval' | 'leave' | 'restore' | 'delete' | 'conflict'; driveFileId?: string; syncState?: SyncState }
export interface Attachment { id: string; documentId: string; name: string; mimeType: string; blob: Blob; driveFileId?: string; createdAt: string; syncState: SyncState }
export interface AppSetting { key: string; value: string }
export interface User { email: string; name: string; picture?: string }
export interface DriveRoots { root: string; journal: string; stories: string; attachments: string; versions: string; appData: string }
