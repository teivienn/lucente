import { createJiti } from 'jiti'
import { existsSync, mkdirSync, realpathSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { LucenteConfig, LucenteConfigInput } from '../config/types'
import { buildAtoms, resolveConfig } from './build'
import { emitDts, emitJs } from './emit'
import { findConfig, findInstall, generatedDirectory } from './locate'

export function loadConfig(file: string): LucenteConfig {
  const jiti = createJiti(file, { interopDefault: true })
  const loaded = jiti(file) as LucenteConfigInput | { default: LucenteConfigInput }
  const input = isConfigModule(loaded) ? loaded.default : loaded
  return resolveConfig(input)
}

export function writeGenerated(dir: string, config: LucenteConfig) {
  const built = buildAtoms(config)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.js'), emitJs(built))
  writeFileSync(join(dir, 'index.d.ts'), emitDts(built))
  return dir
}

export function ensureGenerated(cwd: string) {
  const located = generatedDirectory(cwd)
  const file = join(located.dir, 'index.js')
  const configPath = findConfig(cwd)
  const inputs = [configPath, compilerStamp(cwd)].filter((input): input is string => Boolean(input))

  if (isStale(file, inputs)) {
    const config = configPath ? loadConfig(configPath) : resolveConfig()
    writeGenerated(located.dir, config)
  }

  return { file, redirect: located.redirect, dir: located.dir }
}

export function generate(options: { cwd: string }) {
  const located = generatedDirectory(options.cwd)
  const configPath = findConfig(options.cwd)
  const config = configPath ? loadConfig(configPath) : resolveConfig()
  writeGenerated(located.dir, config)
  return located
}

function isStale(output: string, inputs: string[]) {
  if (!existsSync(output))
    return true
  const outputTime = statSync(output).mtimeMs
  return inputs.some(file => existsSync(file) && statSync(file).mtimeMs >= outputTime)
}

function compilerStamp(cwd: string) {
  const install = findInstall(cwd)
  if (!install)
    return null
  return join(realpathSync(install), 'dist', 'compiler.js')
}

function isConfigModule(value: LucenteConfigInput | { default: LucenteConfigInput }): value is { default: LucenteConfigInput } {
  return Boolean(value) && typeof value === 'object' && 'default' in value && !('space' in value)
}
