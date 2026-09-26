import type { LucenteConfig, LucenteConfigInput } from './types'

export function defineConfig(config: LucenteConfigInput): LucenteConfigInput {
  return config
}

export type { FontAtom, LucenteConfig, LucenteConfigInput } from './types'
export { defaultConfig } from './defaults'
