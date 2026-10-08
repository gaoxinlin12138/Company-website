/**
 * 表单字段清洗：只接受字符串，去除首尾空白并限制长度。
 * 后台各 POST / PATCH 处理器共用，避免每个文件重复定义。
 */
export function readText(input: Record<string, unknown> | null | undefined, key: string, max = 10000): string {
  const value = input?.[key]
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

/** 与 readText 相同，但不限长度。 */
export function readRawText(input: Record<string, unknown> | null | undefined, key: string): string {
  const value = input?.[key]
  return typeof value === 'string' ? value.trim() : ''
}
