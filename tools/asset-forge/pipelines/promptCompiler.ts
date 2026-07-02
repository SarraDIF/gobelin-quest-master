import * as fs from 'fs'

export type Template = any
export type Modifier = any

export function loadJSON(filePath: string): any {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

export function compilePrompt(template: Template, modifiers: Modifier[]): { prompt: string; negative?: string; suffix: string; tags: string[] } {
  const parts: string[] = []
  const negativeParts: string[] = []
  const tags: string[] = []
  const suffixes: string[] = []
  const seen = new Set<string>()

  function addPart(raw?: string) {
    if (!raw) return
    const v = raw.trim()
    if (!v) return
    if (seen.has(v)) return
    seen.add(v)
    parts.push(v)
  }

  // 1) Base description
  addPart(template.description)

  // 2) Inject characterDNA values (if present) BEFORE rendering style and art direction
  if (template.characterDNA) {
    let dnaValues: string[] = []
    if (Array.isArray(template.characterDNA)) {
      dnaValues = template.characterDNA.map(String)
    } else if (typeof template.characterDNA === 'object') {
      dnaValues = Object.values(template.characterDNA).map(String)
    }
    for (const d of dnaValues) addPart(d)
  }

  // 3) Keep rendering style and art direction after DNA
  addPart(template.renderingStyle)
  addPart(template.artDirection)

  // 4) Modifiers (ensure no duplicates)
  for (const mod of modifiers) {
    if (!mod) continue
    addPart(mod.promptAddition)
    if (mod.negativePrompt) negativeParts.push(mod.negativePrompt)
    if (mod.tags) tags.push(...mod.tags)
    if (mod.suffix) suffixes.push(mod.suffix)
  }

  const prompt = parts.join(', ')
  const negative = negativeParts.length ? Array.from(new Set(negativeParts)).join(', ') : undefined
  const suffix = suffixes.join('-')

  return { prompt, negative, suffix, tags }
}
