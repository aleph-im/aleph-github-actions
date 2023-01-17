import { randomBytes } from 'node:crypto'
import { writeFile, readFile } from 'node:fs/promises'
import { join } from 'path'

const N_BYTES = 20
const relPath = process.argv[1]
                .replace(/\w+\.m?js$/gi, '') // strip current file
const jsFilePath = join(relPath, 'src/randombytes.js')
const htmlFilePath = join(relPath, 'index.html')
const r = randomBytes(N_BYTES).toString('hex')

// Injecting a random hex value into the build
await writeFile(jsFilePath, `export const randomBytes = '${r}'`)

// Replacing the document title with the random hex
const htmlDoc = await readFile(join(relPath, 'index.html'), 'utf-8')
await writeFile(htmlFilePath, htmlDoc.replace(/\<title\>\w*\<\/title\>/gi, `<title>${r}</title>`))

console.log(`Generated a ${N_BYTES} hex string: ${r}`)