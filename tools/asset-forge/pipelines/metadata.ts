import * as fs from 'fs'
import * as path from 'path'

export function writeMetadata(metadata: any, outputDir: string, filename: string) {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })
  const outPath = path.join(outputDir, filename + '.json')
  fs.writeFileSync(outPath, JSON.stringify(metadata, null, 2))
}
