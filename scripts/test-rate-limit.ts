import { rateLimit } from '../lib/rateLimit'

async function main() {
  // Unique identifier so we don't collide with anything real.
  const testId = `test-${Date.now()}`
  const limit = 5
  const window = '1 m' as const

  console.log(`\nTesting: ${limit} per ${window}, identifier=${testId}`)
  console.log('-'.repeat(60))

  for (let i = 1; i <= 7; i++) {
    const r = await rateLimit('test', testId, limit, window)
    const status = r.success ? 'PASS' : 'BLOCKED (429)'
    console.log(
      `Call #${i.toString().padStart(2)}: ${status.padEnd(13)} | remaining=${r.remaining}`
    )
  }

  console.log('-'.repeat(60))
  console.log('Expected: first 5 PASS, last 2 BLOCKED\n')
}

main().catch(e => { console.error(e); process.exit(1) })
