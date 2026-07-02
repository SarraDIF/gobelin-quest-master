export type Task<T> = () => Promise<T>

export async function runSequentially<T>(tasks: Task<T>[], retry = 1, cooldownMs = 1000) {
  const results: { success: boolean; result?: T; error?: any }[] = []
  for (let i = 0; i < tasks.length; i++) {
    let attempt = 0
    let success = false
    let lastError: any = null
    while (attempt <= retry && !success) {
      try {
        const res = await tasks[i]()
        results.push({ success: true, result: res })
        success = true
      } catch (err) {
        lastError = err
        attempt++
        if (attempt <= retry) await new Promise(r => setTimeout(r, cooldownMs))
      }
    }
    if (!success) results.push({ success: false, error: lastError })
    // cooldown between tasks
    if (i < tasks.length - 1) await new Promise(r => setTimeout(r, cooldownMs))
  }
  return results
}
