import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'
import { execSync } from 'child_process'
import OpenAI from 'openai'
import 'dotenv/config'

const IMAGE_GENERATION_DELAY_MS = 3000

const QUALITY_COSTS: Record<string, number> = {
  low: 0.01,
  medium: 0.04,
  high: 0.17,
}

interface ImageJob {
  title: string
  filename: string
  path: string
  prompt: string
  status: 'pending' | 'done' | 'error'
  model?: string
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792'
  quality?: 'low' | 'medium' | 'high'
  transparent?: boolean
  referenceImagePaths?: string[]
  generatedAt?: string
}

interface Stats {
  generated: number
  failed: number
  skipped: number
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag)
}

function getArgValue(args: string[], flag: string): string | null {
  const index = args.indexOf(flag)
  if (index !== -1 && args[index + 1] && !args[index + 1].startsWith('--')) {
    return args[index + 1]
  }
  return null
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function promptConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'y')
    })
  })
}

function estimateCost(jobs: ImageJob[]): {
  byQuality: Record<string, number>
  total: number
} {
  const byQuality: Record<string, number> = {
    low: 0,
    medium: 0,
    high: 0,
  }
  let total = 0

  for (const job of jobs) {
    const quality = job.quality || 'medium'
    const cost = QUALITY_COSTS[quality] || QUALITY_COSTS.medium
    byQuality[quality] = (byQuality[quality] || 0) + 1
    total += cost
  }

  return { byQuality, total }
}

function getJobsPath(args: string[]): string {
  const customPath = getArgValue(args, '--jobs')
  if (customPath) {
    return path.resolve(customPath)
  }
  return path.join(process.cwd(), 'image-jobs.json')
}

async function loadJobs(jobsPath: string): Promise<ImageJob[]> {
  if (!fs.existsSync(jobsPath)) {
    console.error(`❌ Jobs file not found: ${jobsPath}`)
    process.exit(1)
  }
  const content = fs.readFileSync(jobsPath, 'utf-8')
  return JSON.parse(content)
}

function saveJobs(jobs: ImageJob[], jobsPath: string): void {
  fs.writeFileSync(jobsPath, JSON.stringify(jobs, null, 2))
}

function getPendingJobs(jobs: ImageJob[]): ImageJob[] {
  return jobs.filter((job) => job.status === 'pending')
}

function findJobByFilename(jobs: ImageJob[], filename: string): ImageJob | null {
  return jobs.find((job) => job.filename === filename) || null
}

function copyToClipboard(text: string): boolean {
  try {
    if (process.platform === 'win32') {
      execSync('powershell -NoProfile -Command "Set-Clipboard -Value $input"', {
        input: text,
      })
    } else if (process.platform === 'darwin') {
      execSync('pbcopy', { input: text })
    } else {
      execSync('xclip -selection clipboard', { input: text })
    }
    return true
  } catch {
    return false
  }
}

function mapQuality(quality?: string): 'standard' | 'hd' {
  if (quality === 'high') return 'hd'
  return 'standard'
}

async function generateImage(
  prompt: string,
  referenceImagePaths: string[] = [],
  model: string = 'gpt-image-1',
  size: string = '1024x1024',
  quality?: string,
): Promise<Buffer> {
  // Use edit mode if reference images provided
  if (referenceImagePaths.length > 0) {
    const refPath = path.join(process.cwd(), referenceImagePaths[0])
    if (!fs.existsSync(refPath)) {
      throw new Error(`Reference image not found: ${refPath}`)
    }

    const imageBuffer = fs.readFileSync(refPath)

    const response = await client.images.edit({
      image: new File([imageBuffer], 'image.png', { type: 'image/png' }),
      prompt,
      n: 1,
      size: size as '256x256' | '512x512' | '1024x1024',
      model,
    })

    if (!response.data[0].url) {
      throw new Error('Failed to generate edited image: no URL in response')
    }

    const imageResponse = await fetch(response.data[0].url)
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`)
    }

    return Buffer.from(await imageResponse.arrayBuffer())
  }

  // Use generate mode if no references
  const response = await client.images.generate({
    model,
    prompt,
    n: 1,
    size: size as '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792',
    quality: quality ? mapQuality(quality) : undefined,
  })

  if (!response.data[0].url) {
    throw new Error('Failed to generate image: no URL in response')
  }

  const imageResponse = await fetch(response.data[0].url)
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageResponse.statusText}`)
  }

  return Buffer.from(await imageResponse.arrayBuffer())
}

async function processJob(job: ImageJob): Promise<boolean> {
  try {
    const model = job.model || 'gpt-image-1'
    const size = job.size || '1024x1024'
    const isEdit = (job.referenceImagePaths?.length || 0) > 0

    console.log(`\n🎨 ${isEdit ? 'Editing' : 'Generating'}: ${job.title}`)
    console.log(`   Model: ${model} | Size: ${size}${job.quality ? ` | Quality: ${job.quality}` : ''}`)
    if (isEdit) {
      console.log(`   Using ${job.referenceImagePaths?.length} reference image(s)`)
    }

    const imageBuffer = await generateImage(
      job.prompt,
      job.referenceImagePaths,
      model,
      size,
      job.quality,
    )

    // Create directory if missing
    const fullPath = path.join(process.cwd(), job.path, job.filename)
    const dirPath = path.dirname(fullPath)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }

    // Save image - handle both binary and base64
    if (job.filename.endsWith('.base64')) {
      const base64 = imageBuffer.toString('base64')
      fs.writeFileSync(fullPath, base64)
    } else {
      fs.writeFileSync(fullPath, imageBuffer)
    }

    console.log(`   ✅ Saved to: ${fullPath}`)

    job.status = 'done'
    job.generatedAt = new Date().toISOString()
    return true
  } catch (error) {
    console.error(
      `   ❌ Error: ${error instanceof Error ? error.message : error}`,
    )
    job.status = 'error'
    return false
  }
}

async function handleNextManual(jobsPath: string): Promise<void> {
  const jobs = await loadJobs(jobsPath)
  const pendingJobs = getPendingJobs(jobs)

  if (pendingJobs.length === 0) {
    console.log('✅ No pending jobs!')
    return
  }

  const job = pendingJobs[0]
  const fullPath = path.join(job.path, job.filename)

  console.log('\n📋 Next Manual Job:')
  console.log(`   Title: ${job.title}`)
  console.log(`   Path: ${fullPath}`)
  if (job.quality) console.log(`   Quality: ${job.quality}`)
  if (job.transparent) console.log(`   Transparent: yes`)
  if (job.referenceImagePaths?.length) {
    console.log(`   References: ${job.referenceImagePaths.join(', ')}`)
  }

  console.log(`\n📝 Prompt:\n`)
  console.log(job.prompt)

  const copied = copyToClipboard(job.prompt)
  console.log(
    `\n${copied ? '✅ Prompt copied to clipboard!' : '⚠️  Clipboard unavailable (paste manually)'}`,
  )
}

async function handleMarkDone(jobsPath: string, filename: string): Promise<void> {
  const jobs = await loadJobs(jobsPath)
  const job = findJobByFilename(jobs, filename)

  if (!job) {
    console.error(`❌ Job not found: ${filename}`)
    process.exit(1)
  }

  job.status = 'done'
  job.generatedAt = new Date().toISOString()
  saveJobs(jobs, jobsPath)

  console.log(`✅ Marked as done: ${job.title}`)
  console.log(`   Generated at: ${job.generatedAt}`)
}

async function handleMarkError(jobsPath: string, filename: string): Promise<void> {
  const jobs = await loadJobs(jobsPath)
  const job = findJobByFilename(jobs, filename)

  if (!job) {
    console.error(`❌ Job not found: ${filename}`)
    process.exit(1)
  }

  job.status = 'error'
  saveJobs(jobs, jobsPath)

  console.log(`⚠️  Marked as error: ${job.title}`)
}

async function handleAutomatic(jobsPath: string, generateAll: boolean): Promise<void> {
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not set in .env file')
    process.exit(1)
  }

  const jobs = await loadJobs(jobsPath)
  const pendingJobs = getPendingJobs(jobs)

  if (pendingJobs.length === 0) {
    console.log('✅ No pending jobs to process!')
    return
  }

  const jobsToProcess = generateAll ? pendingJobs : [pendingJobs[0]]

  // Show cost estimation and ask for confirmation
  const { byQuality, total } = estimateCost(jobsToProcess)
  console.log('\n' + '='.repeat(50))
  console.log('💰 Cost Estimation:')
  if (byQuality.low > 0) console.log(`   Low:    ${byQuality.low} × $0.01 = $${(byQuality.low * 0.01).toFixed(2)}`)
  if (byQuality.medium > 0) console.log(`   Medium: ${byQuality.medium} × $0.04 = $${(byQuality.medium * 0.04).toFixed(2)}`)
  if (byQuality.high > 0) console.log(`   High:   ${byQuality.high} × $0.17 = $${(byQuality.high * 0.17).toFixed(2)}`)
  console.log(`   Total:  $${total.toFixed(2)}`)
  console.log('='.repeat(50) + '\n')

  const confirmed = await promptConfirmation('Continue? (y/n): ')
  if (!confirmed) {
    console.log('❌ Generation cancelled.')
    return
  }

  const stats: Stats = { generated: 0, failed: 0, skipped: 0 }

  console.log(
    `📋 Processing ${jobsToProcess.length} job(s)${generateAll ? ' (--all)' : ''}...\n`,
  )

  for (let i = 0; i < jobsToProcess.length; i++) {
    const job = jobsToProcess[i]
    const success = await processJob(job)
    if (success) {
      stats.generated++
    } else {
      stats.failed++
    }

    // Add delay between jobs only when processing multiple jobs
    if (generateAll && i < jobsToProcess.length - 1) {
      console.log(`\n⏳ Waiting ${IMAGE_GENERATION_DELAY_MS / 1000}s before next job...`)
      await sleep(IMAGE_GENERATION_DELAY_MS)
    }
  }

  // Save all updates
  saveJobs(jobs, jobsPath)

  // Print summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 Summary:')
  console.log(`   ✅ Generated: ${stats.generated}`)
  console.log(`   ❌ Failed: ${stats.failed}`)
  console.log(`   ⏭️  Skipped: ${stats.skipped}`)
  console.log('='.repeat(50))
}

async function main() {
  try {
    const args = process.argv.slice(2)
    const jobsPath = getJobsPath(args)

    console.log(`📂 Using jobs file: ${jobsPath}\n`)

    // Handle commands - order doesn't matter now
    if (hasFlag(args, '--next-manual')) {
      await handleNextManual(jobsPath)
    } else if (hasFlag(args, '--mark-done')) {
      const filename = getArgValue(args, '--mark-done')
      if (!filename) {
        console.error('❌ Usage: --mark-done <filename>')
        process.exit(1)
      }
      await handleMarkDone(jobsPath, filename)
    } else if (hasFlag(args, '--mark-error')) {
      const filename = getArgValue(args, '--mark-error')
      if (!filename) {
        console.error('❌ Usage: --mark-error <filename>')
        process.exit(1)
      }
      await handleMarkError(jobsPath, filename)
    } else if (hasFlag(args, '--all')) {
      await handleAutomatic(jobsPath, true)
    } else {
      await handleAutomatic(jobsPath, false)
    }
  } catch (error) {
    console.error('❌ Fatal error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
