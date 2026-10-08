/**
 * GCJ-02（高德/国内地图坐标）与 WGS-84（OpenStreetMap 瓦片坐标）之间的换算，
 * 以及经纬度到瓦片像素坐标的换算。
 * 前台联系页的静态底图和后台的拖动选点共用同一套计算。
 */

export type GeoPoint = { latitude: number; longitude: number }

function transformLat(x: number, y: number) {
  let result = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
  result += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3
  result += (20 * Math.sin(y * Math.PI) + 40 * Math.sin(y / 3 * Math.PI)) * 2 / 3
  result += (160 * Math.sin(y / 12 * Math.PI) + 320 * Math.sin(y * Math.PI / 30)) * 2 / 3
  return result
}

function transformLon(x: number, y: number) {
  let result = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
  result += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3
  result += (20 * Math.sin(x * Math.PI) + 40 * Math.sin(x / 3 * Math.PI)) * 2 / 3
  result += (150 * Math.sin(x / 12 * Math.PI) + 300 * Math.sin(x / 30 * Math.PI)) * 2 / 3
  return result
}

export function outOfChina(latitude: number, longitude: number) {
  return longitude < 72.004 || longitude > 137.8347 || latitude < 0.8293 || latitude > 55.8271
}

export function gcj02ToWgs84(latitude: number, longitude: number, guardOutsideChina = false): GeoPoint {
  if (guardOutsideChina && outOfChina(latitude, longitude)) return { latitude, longitude }
  const earthRadius = 6378245
  const eccentricity = 0.006693421622965943
  const dLat = transformLat(longitude - 105, latitude - 35)
  const dLon = transformLon(longitude - 105, latitude - 35)
  const radLat = latitude * Math.PI / 180
  let magic = Math.sin(radLat)
  magic = 1 - eccentricity * magic * magic
  const sqrtMagic = Math.sqrt(magic)
  const deltaLat = dLat * 180 / ((earthRadius * (1 - eccentricity)) / (magic * sqrtMagic) * Math.PI)
  const deltaLon = dLon * 180 / (earthRadius / sqrtMagic * Math.cos(radLat) * Math.PI)
  return { latitude: latitude - deltaLat, longitude: longitude - deltaLon }
}

export function wgs84ToGcj02(latitude: number, longitude: number, guardOutsideChina = false): GeoPoint {
  if (guardOutsideChina && outOfChina(latitude, longitude)) return { latitude, longitude }
  let guess = { latitude, longitude }
  for (let index = 0; index < 4; index += 1) {
    const converted = gcj02ToWgs84(guess.latitude, guess.longitude, guardOutsideChina)
    guess = { latitude: latitude + (guess.latitude - converted.latitude), longitude: longitude + (guess.longitude - converted.longitude) }
  }
  return guess
}

export function tilePoint(latitude: number, longitude: number, zoom: number) {
  const scale = 2 ** zoom
  const x = ((longitude + 180) / 360) * scale
  const sine = Math.sin((latitude * Math.PI) / 180)
  const y = (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * scale
  return { x, y, tileX: Math.floor(x), tileY: Math.floor(y), offsetX: x - Math.floor(x), offsetY: y - Math.floor(y) }
}

export function pointToLocation(x: number, y: number, zoom: number): GeoPoint {
  const scale = 2 ** zoom
  const longitude = x / scale * 360 - 180
  const n = Math.PI - (2 * Math.PI * y) / scale
  const latitude = 180 / Math.PI * Math.atan(Math.sinh(n))
  return { latitude, longitude }
}
