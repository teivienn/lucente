# Lucente

Atomic styles for React Native. You describe spacing, type, radius, and breakpoints in `lucente.config.ts`. Lucente turns that file into a `StyleSheet` and you import the result from `lucente`.

```tsx
import { atoms, useLucente, withLucente } from 'lucente'
import { View } from 'react-native'

const Screen = withLucente(View, atoms.flex_1, atoms.p_lg, atoms.md.px_xl)
```

Requires React 19 or newer and React Native 0.81 or newer.

## Install

```sh
pnpm add lucente
```

npm and Yarn work the same way: `npm install lucente`, `yarn add lucente`.

## Configure

Add `lucente.config.ts` to the root of the app (the directory Metro treats as the project root).

```ts
import { defineConfig } from 'lucente/config'

export default defineConfig({
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
  },
  font: {
    sm: { fontSize: 14, lineHeight: 20 },
    md: { fontSize: 16, lineHeight: 24 },
    lg: { fontSize: 18, lineHeight: 28 },
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 16,
    full: 9999,
  },
  breakpoint: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    xxl: 1536,
  },
  extend: {
    screen: {
      flex: 1,
      backgroundColor: '#0c1222',
    },
    text: {
      color: '#f5f7fb',
    },
  },
})
```

Any section you omit keeps Lucente’s built-in scale. `space` values become padding, margin, gap, width, and height atoms (`p_md`, `mx_lg`, `gap_sm`, `w_xs`). A token named `2xl` becomes the suffix `2xl`, so the atom is `p_2xl`. `font` becomes `text_sm`, `text_md`, and so on, including `fontSize` and `lineHeight`. `radius` becomes `rounded_md` and `rounded_full`.

`breakpoint` names have to be valid JavaScript identifiers (`sm`, `md`, `xxl`). Each name is a minimum width in pixels. Unprefixed atoms apply at every width. `atoms.md.w_1_2` applies from 768px upward and overrides the same property from a narrower breakpoint. On a typical phone (about 390px wide) `sm` at 640px does not apply.

`extend` adds your own atoms. Each one is available on its own and under every breakpoint: `atoms.screen` and `atoms.md.screen`.

## Metro

The bundler reads the config and writes the stylesheet before it resolves `lucente`.

### Expo

```js
const { getDefaultConfig } = require('expo/metro-config')
const { withLucenteMetro } = require('lucente/metro')

module.exports = withLucenteMetro(getDefaultConfig(__dirname))
```

### React Native CLI

```js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')
const { withLucenteMetro } = require('lucente/metro')

module.exports = withLucenteMetro(mergeConfig(getDefaultConfig(__dirname), {}))
```

## Generate

Metro regenerates atoms when the dev server starts and when `lucente.config.ts` is newer than the last build. Generate once after install so TypeScript can see the atom names before you start Metro:

```sh
pnpm exec lucente generate
```

The same command is `npx lucente generate` or `yarn lucente generate`.

Output goes to `node_modules/lucente/generated`. Import it as `lucente`, not as a path in your repository. With pnpm, when the package is a symlink into a shared store, the file is written to `node_modules/.cache/lucente` instead, and the Metro plugin resolves `lucente` to that file for this app only.

After you change the config, run `lucente generate` again (or restart Metro). If autocomplete still shows the old atoms, restart the TypeScript server. The editor often skips files inside `node_modules`.

## Use

Static layout is a normal style array. Those objects come from `StyleSheet.create` and do not subscribe to the window size.

```tsx
import { atoms } from 'lucente'
import { Text, View } from 'react-native'

export function Row() {
  return (
    <View style={[atoms.flex_1, atoms.px_lg, atoms.py_md, atoms.gap_sm]}>
      <Text style={[atoms.text, atoms.text_lg, atoms.font_semibold]}>Title</Text>
    </View>
  )
}
```

Call `withLucente` once at module scope when a component should follow breakpoints. The subscription lives in that component. A parent that only renders it does not re-render when the width crosses `sm` or `md`.

```tsx
import { atoms, withLucente } from 'lucente'
import { View } from 'react-native'

export const Screen = withLucente(
  View,
  atoms.flex_1,
  atoms.screen,
  atoms.p_lg,
  atoms.md.flex_row,
  atoms.md.px_xl,
)

export const Card = withLucente(
  View,
  atoms.card,
  atoms.p_lg,
  atoms.rounded_lg,
  atoms.w_full,
  atoms.md.w_1_2,
)
```

`useLucente` resolves the same atoms to one style object. Use it when a component needs the value itself. A call that includes a breakpoint atom, such as `atoms.md.text_xl`, re-renders that component when the matching width is crossed. A call that uses only plain atoms does not.

```tsx
import { atoms, useLucente } from 'lucente'
import { Text } from 'react-native'

export function Title() {
  const style = useLucente(atoms.text, atoms.text_2xl, atoms.md.text_xl)
  return <Text style={style}>Lucente</Text>
}
```

An incoming `style` prop on a `withLucente` component is applied after the atoms, so it overrides them.

## This repository

`examples/expo` and `examples/bare` are apps wired the same way.

```sh
pnpm install
pnpm test
pnpm expo
pnpm bare
```

`pnpm install` builds the package and generates atoms from the root `lucente.config.ts`.
