import { existsSync, lstatSync, realpathSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'

const CONFIG_NAMES = ['lucente.config.ts', 'lucente.config.mts', 'lucente.config.js', 'lucente.config.mjs']

export function findConfig(start: string): string | null {
  let dir = resolve(start)
  while (true) {
    for (const name of CONFIG_NAMES) {
      const file = join(dir, name)
      if (existsSync(file))
        return file
    }
    const parent = dirname(dir)
    if (parent === dir)
      return null
    dir = parent
  }
}

export function findInstall(start: string): string | null {
  let dir = resolve(start)
  while (true) {
    const candidate = join(dir, 'node_modules', 'lucente')
    if (existsSync(candidate))
      return candidate
    const parent = dirname(dir)
    if (parent === dir)
      return null
    dir = parent
  }
}

export function generatedDirectory(start: string): { dir: string, redirect: boolean, root: string } {
  const config = findConfig(start)
  const root = config ? dirname(config) : resolve(start)
  const install = findInstall(root)

  if (!install) {
    return {
      dir: join(root, 'node_modules', '.cache', 'lucente'),
      redirect: true,
      root,
    }
  }

  const real = realpathSync(install)
  const linked = lstatSync(install).isSymbolicLink()
  const insideProject = real === root || real.startsWith(`${root}${sep}`)

  if (!linked || insideProject) {
    return {
      dir: join(real, 'generated'),
      redirect: false,
      root,
    }
  }

  return {
    dir: join(root, 'node_modules', '.cache', 'lucente'),
    redirect: true,
    root,
  }
}
