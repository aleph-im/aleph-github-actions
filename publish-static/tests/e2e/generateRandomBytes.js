import { randomBytes } from 'node:crypto'
import { writeFile } from 'node:fs/promises'

const r = randomBytes(40).toString('hex')
await writeFile('src/randombytes.js', 
`export const randomBytes = '${r}'`)
