import { generate } from './compiler/generate'

export async function run(argv = process.argv.slice(2)) {
  const command = argv[0] ?? 'generate'
  if (command !== 'generate')
    throw new Error(`Unknown lucente command "${command}". Expected "generate".`)

  const rootFlag = argv.indexOf('--root')
  const cwd = rootFlag >= 0 ? argv[rootFlag + 1] : process.cwd()
  if (!cwd)
    throw new Error('lucente generate --root requires a directory')

  const located = generate({ cwd })
  console.log(`lucente: atoms written to ${located.dir}`)
}
