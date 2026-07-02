import * as fs from 'fs'
import * as path from 'path'
import OpenAI from 'openai'
import 'dotenv/config'
import { load as loadYaml } from 'yaml'
import { compilePrompt, loadJSON } from '../pipelines/promptCompiler'
import { makeVariantCombinations } from '../pipelines/variantGenerator'
import { writeMetadata } from '../pipelines/metadata'
import { runSequentially } from '../pipelines/queue'

// Note: keep simple and readable. This script composes templates + modifiers, creates combinations, and (optionally) calls the OpenAI Images API.

const IMAGE_GENERATION_DELAY_MS = 3000
const QUALITY_COSTS: Record<string, number> = { low: 0.01, medium: 0.04, high: 0.17 }

function hasFlag(args: string[], flag: string): boolean { return args.includes(flag) }
function getArgValue(args: string[], flag: string): string | null {
  const index = args.indexOf(flag)
  if (index !== -1 && args[index + 1] && !args[index + 1].startsWith('--')) return args[index + 1]
  return null
}

function getJobsPath(args: string[]): string {
  const custom = getArgValue(args, '--jobs')
  if (custom) return path.resolve(custom)
  return path.join(process.cwd(), 'jobs', 'pipeline-jobs.json')
}

async function loadJobs(jobsPath: string) {
  if (!fs.existsSync(jobsPath)) { console.error('Jobs file not found:', jobsPath); process.exit(1) }
  return JSON.parse(fs.readFileSync(jobsPath, 'utf-8'))
}

function loadTemplate(name: string) {
  const p = path.join(process.cwd(), 'templates', name + '.template.json')
  if (!fs.existsSync(p)) throw new Error('Template not found: ' + p)
  return JSON.parse(fs.readFileSync(p, 'utf-8'))
}

function loadModifier(kind: string, name: string) {
  const p = path.join(process.cwd(), 'modifiers', kind, name + '.json')
  if (!fs.existsSync(p)) return null
  return JSON.parse(fs.readFileSync(p, 'utf-8'))
}

async function estimateCostForItems(items: any[]) {
  let total = 0
  for (const it of items) {
    const q = it.quality || 'medium'
    total += QUALITY_COSTS[q] || QUALITY_COSTS.medium
  }
  return total
}

async function run() {
  const args = process.argv.slice(2)
  const jobsPath = getJobsPath(args)
  const dryRun = hasFlag(args, '--dry-run')

  console.log('📂 Using jobs file:', jobsPath)

  const jobs = await loadJobs(jobsPath)

  const tasks: (() => Promise<any>)[] = []
  const allPlanned: any[] = []

  for (const job of jobs) {
    const template = loadTemplate(job.template)
    // build modifier lists
    const modSpec = job.variants || {}
    const combinations = makeVariantCombinations(modSpec)
    // if combinations empty, push a single empty combo
    const combos = combinations.length ? combinations : [{}]

    for (const combo of combos) {
      const modifiers: any[] = []
      // load moods
      if (combo.moods) {
        const m = loadModifier('moods', combo.moods)
        if (m) modifiers.push(m)
      }
      if (combo.environments) {
        const m = loadModifier('environments', combo.environments)
        if (m) modifiers.push(m)
      }
      if (combo.accessories) {
        const m = loadModifier('accessories', combo.accessories)
        if (m) modifiers.push(m)
      }

      const compiled = compilePrompt(template, modifiers)
      const quality = job.quality || template.quality || 'medium'
      const filenameBase = [job.filenamePrefix || template.name, compiled.suffix].filter(Boolean).join('-')
      const filename = `${filenameBase}.png`
      const outPath = path.join(process.cwd(), job.outputPath || 'generated', filename)

      const plan = {
        job,
        template: template.name,
        modifiers: combo,
        prompt: compiled.prompt,
        negative: compiled.negative,
        filename,
        outPath,
        quality,
      }

      allPlanned.push(plan)

      tasks.push(async () => {
        // generation task
        if (dryRun) {
          // write metadata only
          writeMetadata({ plan, dryRun: true, estimatedCost: QUALITY_COSTS[quality] }, path.join(process.cwd(), 'metadata'), filename)
          console.log('[dry] ', filename)
          return { ok: true }
        }

        // actual generation: for simplicity reuse Images.generate
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        const resp = await client.images.generate({ model: template.defaultModel || job.model || 'gpt-image-1', prompt: compiled.prompt, n: 1, size: template.defaultSize || job.size || '1024x1024' })
        if (!resp.data || !resp.data[0] || !resp.data[0].url) throw new Error('No image returned')
        const imageUrl: string = resp.data[0].url
        const res = await fetch(imageUrl)
        const buffer = Buffer.from(await res.arrayBuffer())
        // ensure dir
        const dir = path.dirname(outPath)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(outPath, buffer)
        writeMetadata({ plan, generatedAt: new Date().toISOString(), estimatedCost: QUALITY_COSTS[quality] }, path.join(process.cwd(), 'metadata'), filename)
        console.log('Saved ->', outPath)
        return { ok: true }
      })
    }
  }

  // estimate cost and show summary for automatic runs
  const totalCost = await estimateCostForItems(allPlanned)
  if (!dryRun) {
    console.log('\n' + '='.repeat(40))
    console.log('Planned assets:', allPlanned.length)
    console.log('Estimated total cost: $' + totalCost.toFixed(2))
    console.log('Run mode: automatic')
    const confirmed = await (async () => {
      process.stdout.write('Continue? (y/n): ')
      return new Promise<boolean>(resolve => {
        process.stdin.once('data', d => resolve(d.toString().trim().toLowerCase() === 'y'))
      })
    })()
    if (!confirmed) { console.log('Aborted by user'); return }
  }

  // run tasks sequentially with retries and cooldown
  const results = await runSequentially(tasks, 1, IMAGE_GENERATION_DELAY_MS)
  const succeeded = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  console.log('\nGeneration complete. succeeded:', succeeded, 'failed:', failed)
}

run().catch(err => { console.error(err); process.exit(1) })
