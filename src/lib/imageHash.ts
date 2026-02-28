import sharp from 'sharp'
import fs from 'fs'

export async function computeHashFromBase64(b64: string) {
  const buf = Buffer.from(b64, 'base64')
  const resized = await sharp(buf).grayscale().resize(16, 16, { fit: 'fill' }).raw().toBuffer()
  const avg = resized.reduce((a, b) => a + b, 0) / resized.length
  let bits = ''
  for (const v of resized) bits += v > avg ? '1' : '0'
  return bits
}

export async function computeHashFromFile(filePath: string) {
  const buf = fs.readFileSync(filePath)
  const resized = await sharp(buf).grayscale().resize(16, 16, { fit: 'fill' }).raw().toBuffer()
  const avg = resized.reduce((a, b) => a + b, 0) / resized.length
  let bits = ''
  for (const v of resized) bits += v > avg ? '1' : '0'
  return bits
}

export function hammingDistance(a: string, b: string) {
  const len = Math.min(a.length, b.length)
  let d = 0
  for (let i = 0; i < len; i++) if (a[i] !== b[i]) d++
  d += Math.abs(a.length - b.length)
  return d
}