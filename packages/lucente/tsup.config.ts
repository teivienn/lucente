import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    runtime: 'src/runtime/index.ts',
    config: 'src/config/index.ts',
    compiler: 'src/compiler/index.ts',
    core: 'src/core/index.ts',
    cli: 'src/cli.ts',
    metro: 'src/metro/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['react', 'react-native', 'jiti'],
})
