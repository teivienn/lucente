import type { MetroConfig } from './types'
import { ensureGenerated } from '../compiler/generate'

export function withLucenteMetro<T extends MetroConfig>(config: T): T {
  const upstream = config.resolver?.resolveRequest

  config.resolver ??= {}
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === 'lucente') {
      const generated = ensureGenerated(context.projectRoot ?? process.cwd())
      if (generated.redirect) {
        return {
          type: 'sourceFile',
          filePath: generated.file,
        }
      }
    }

    if (upstream)
      return upstream(context, moduleName, platform)
    return context.resolveRequest(context, moduleName, platform)
  }

  return config
}
