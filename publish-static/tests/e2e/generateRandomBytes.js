import { randomBytes } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import { join } from 'path'

const N_BYTES = 20
const relPath = process.argv[1]
                .replace(/\w+\.m?js$/gi, '') // strip current file

const r = randomBytes(N_BYTES).toString('hex')

await writeFile(join(relPath, 'src/randombytes.js'), `export const randomBytes = '${r}'`)
console.log(`Generated an ${N_BYTES} hex string: ${r}`)