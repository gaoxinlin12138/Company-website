import mysql from 'mysql2/promise'

type MysqlPool = ReturnType<typeof mysql.createPool>
const globalForMysql = globalThis as unknown as { hongcaiPool?: MysqlPool }

export function getMysqlPool() {
  if (globalForMysql.hongcaiPool) return globalForMysql.hongcaiPool
  const config = useRuntimeConfig()
  const url = new URL(config.databaseUrl)
  const pool = mysql.createPool({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    waitForConnections: true,
    connectionLimit: 5,
    charset: 'utf8mb4'
  })
  globalForMysql.hongcaiPool = pool
  return pool
}

