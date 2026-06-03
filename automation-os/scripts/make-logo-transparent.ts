#!/usr/bin/env ts-node
/** One-off: knock the white background out of the CE logo → transparent PNG. */
import * as fs from 'fs'
import * as path from 'path'
import { chromium } from '@playwright/test'

const ROOT = path.resolve(__dirname, '../..')
const SRC = path.join(ROOT, 'automation-os/assets/colvin-logo-raw.png')
const OUT = path.join(ROOT, 'automation-os/assets/colvin-logo.png')

async function main() {
  const dataUri = 'data:image/png;base64,' + fs.readFileSync(SRC).toString('base64')
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    const out = await page.evaluate(async (uri) => {
      const img = new Image()
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = uri })
      const c = document.createElement('canvas')
      c.width = img.naturalWidth; c.height = img.naturalHeight
      const ctx = c.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const d = ctx.getImageData(0, 0, c.width, c.height)
      const p = d.data
      for (let i = 0; i < p.length; i += 4) {
        const r = p[i], g = p[i + 1], b = p[i + 2]
        // near-white → transparent; feather light grays at the edge
        if (r > 232 && g > 230 && b > 225) {
          p[i + 3] = 0
        } else if (r > 210 && g > 208 && b > 200) {
          p[i + 3] = Math.min(p[i + 3], 90)
        }
      }
      ctx.putImageData(d, 0, 0)
      // autocrop transparent margins
      let minX = c.width, minY = c.height, maxX = 0, maxY = 0
      for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
        if (p[(y * c.width + x) * 4 + 3] > 10) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y }
      }
      const pad = 12
      minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad)
      maxX = Math.min(c.width - 1, maxX + pad); maxY = Math.min(c.height - 1, maxY + pad)
      const w = maxX - minX + 1, h = maxY - minY + 1
      const c2 = document.createElement('canvas'); c2.width = w; c2.height = h
      c2.getContext('2d')!.putImageData(ctx.getImageData(minX, minY, w, h), 0, 0)
      return c2.toDataURL('image/png')
    }, dataUri)
    fs.writeFileSync(OUT, Buffer.from(out.split(',')[1], 'base64'))
    console.log('✓ transparent logo →', OUT)
  } finally {
    await browser.close()
  }
}
main().catch(e => { console.error('FATAL:', e); process.exit(1) })
