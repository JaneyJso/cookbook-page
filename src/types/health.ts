export interface HealthRecord {
  id: string
  date: string           // 记录日期 YYYY-MM-DD
  conditions: string[]   // 当前状况标签列表
  note: string           // 备注
}
