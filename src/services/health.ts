import type { HealthRecord } from '@/types/health'
import { getStorage, setStorage, STORAGE_KEYS } from '@/utils/storage'
import { generateId } from '@/utils/id'

export function getAllRecords(): HealthRecord[] {
  return getStorage<HealthRecord[]>(STORAGE_KEYS.HEALTH_RECORDS, [])
}

export function getRecordById(id: string): HealthRecord | undefined {
  const records = getAllRecords()
  return records.find(r => r.id === id)
}

export function createRecord(data: Omit<HealthRecord, 'id'>): HealthRecord {
  const record: HealthRecord = {
    ...data,
    id: generateId(),
  }
  const records = getAllRecords()
  records.unshift(record)
  setStorage(STORAGE_KEYS.HEALTH_RECORDS, records)
  return record
}

export function deleteRecord(id: string): boolean {
  const records = getAllRecords()
  const filtered = records.filter(r => r.id !== id)
  if (filtered.length === records.length) return false
  setStorage(STORAGE_KEYS.HEALTH_RECORDS, filtered)
  return true
}

export function getLatestRecord(): HealthRecord | undefined {
  const records = getAllRecords()
  if (records.length === 0) return undefined
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
}

export function getRecordsByDateRange(startDate: string, endDate: string): HealthRecord[] {
  const records = getAllRecords()
  return records.filter(r => r.date >= startDate && r.date <= endDate)
}

export function getRecordsByMonth(year: number, month: number): HealthRecord[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  const records = getAllRecords()
  return records.filter(r => r.date.startsWith(prefix))
}
