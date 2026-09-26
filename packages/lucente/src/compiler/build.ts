import type { LucenteConfig, LucenteConfigInput } from '../config/types'
import { defaultConfig } from '../config/defaults'

const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/

export type StyleValue = string | number | { kind: 'hairline' }

export interface BuiltAtoms {
  styles: Record<string, Record<string, StyleValue>>
  breakpoints: { name: string, minWidth: number }[]
}

const SPACE_PROPS: Record<string, string[]> = {
  p: ['padding'],
  px: ['paddingHorizontal'],
  py: ['paddingVertical'],
  pt: ['paddingTop'],
  pb: ['paddingBottom'],
  pl: ['paddingLeft'],
  pr: ['paddingRight'],
  ps: ['paddingStart'],
  pe: ['paddingEnd'],
  m: ['margin'],
  mx: ['marginHorizontal'],
  my: ['marginVertical'],
  mt: ['marginTop'],
  mb: ['marginBottom'],
  ml: ['marginLeft'],
  mr: ['marginRight'],
  ms: ['marginStart'],
  me: ['marginEnd'],
  gap: ['gap'],
  gap_x: ['columnGap'],
  gap_y: ['rowGap'],
  w: ['width'],
  h: ['height'],
}

export function resolveConfig(input: LucenteConfigInput = {}): LucenteConfig {
  return {
    space: input.space ?? defaultConfig.space,
    font: input.font ?? defaultConfig.font,
    radius: input.radius ?? defaultConfig.radius,
    breakpoint: input.breakpoint ?? defaultConfig.breakpoint,
    extend: input.extend ?? {},
  }
}

export function buildAtoms(input: LucenteConfigInput = {}): BuiltAtoms {
  const config = resolveConfig(input)
  const styles: BuiltAtoms['styles'] = {}

  const define = (name: string, style: Record<string, StyleValue>) => {
    if (styles[name])
      throw new Error(`Lucente atom "${name}" is declared more than once`)
    styles[name] = style
  }

  define('absolute', { position: 'absolute' })
  define('relative', { position: 'relative' })
  define('inset_0', { top: 0, right: 0, bottom: 0, left: 0 })
  define('overflow_hidden', { overflow: 'hidden' })
  define('hidden', { display: 'none' })
  define('flex', { display: 'flex' })

  define('flex_0', { flex: 0 })
  define('flex_1', { flex: 1 })
  define('flex_row', { flexDirection: 'row' })
  define('flex_col', { flexDirection: 'column' })
  define('flex_row_reverse', { flexDirection: 'row-reverse' })
  define('flex_col_reverse', { flexDirection: 'column-reverse' })
  define('flex_wrap', { flexWrap: 'wrap' })
  define('flex_nowrap', { flexWrap: 'nowrap' })
  define('flex_grow', { flexGrow: 1 })
  define('flex_grow_0', { flexGrow: 0 })
  define('flex_shrink', { flexShrink: 1 })
  define('flex_shrink_0', { flexShrink: 0 })

  define('justify_start', { justifyContent: 'flex-start' })
  define('justify_center', { justifyContent: 'center' })
  define('justify_end', { justifyContent: 'flex-end' })
  define('justify_between', { justifyContent: 'space-between' })
  define('justify_around', { justifyContent: 'space-around' })
  define('justify_evenly', { justifyContent: 'space-evenly' })

  define('align_start', { alignItems: 'flex-start' })
  define('align_center', { alignItems: 'center' })
  define('align_end', { alignItems: 'flex-end' })
  define('align_stretch', { alignItems: 'stretch' })
  define('align_baseline', { alignItems: 'baseline' })

  define('self_auto', { alignSelf: 'auto' })
  define('self_start', { alignSelf: 'flex-start' })
  define('self_center', { alignSelf: 'center' })
  define('self_end', { alignSelf: 'flex-end' })
  define('self_stretch', { alignSelf: 'stretch' })

  define('w_full', { width: '100%' })
  define('w_auto', { width: 'auto' })
  define('w_1_2', { width: '50%' })
  define('w_1_3', { width: '33.333%' })
  define('w_2_3', { width: '66.666%' })
  define('w_1_4', { width: '25%' })
  define('w_3_4', { width: '75%' })
  define('h_full', { height: '100%' })
  define('h_auto', { height: 'auto' })
  define('h_1_2', { height: '50%' })
  define('max_w_full', { maxWidth: '100%' })

  define('text_left', { textAlign: 'left' })
  define('text_center', { textAlign: 'center' })
  define('text_right', { textAlign: 'right' })
  define('font_normal', { fontWeight: '400' })
  define('font_medium', { fontWeight: '500' })
  define('font_semibold', { fontWeight: '600' })
  define('font_bold', { fontWeight: '700' })

  define('bg_transparent', { backgroundColor: 'transparent' })

  define('border_0', { borderWidth: 0 })
  define('border', { borderWidth: { kind: 'hairline' } })
  define('border_t', { borderTopWidth: { kind: 'hairline' } })
  define('border_b', { borderBottomWidth: { kind: 'hairline' } })
  define('border_l', { borderLeftWidth: { kind: 'hairline' } })
  define('border_r', { borderRightWidth: { kind: 'hairline' } })

  for (const [name, value] of Object.entries(config.space)) {
    if (typeof value !== 'number')
      throw new Error(`Lucente space "${name}" must be a number`)
    const token = suffix(name)
    for (const [prefix, props] of Object.entries(SPACE_PROPS)) {
      const style: Record<string, StyleValue> = {}
      for (const prop of props)
        style[prop] = value
      define(`${prefix}_${token}`, style)
    }
  }

  for (const [name, value] of Object.entries(config.font)) {
    if (typeof value?.fontSize !== 'number' || typeof value.lineHeight !== 'number')
      throw new Error(`Lucente font "${name}" needs fontSize and lineHeight`)
    define(`text_${suffix(name)}`, {
      fontSize: value.fontSize,
      lineHeight: value.lineHeight,
    })
  }

  for (const [name, value] of Object.entries(config.radius)) {
    define(`rounded_${suffix(name)}`, { borderRadius: value })
  }

  for (const [name, style] of Object.entries(config.extend)) {
    define(suffix(name), style)
  }

  const breakpoints = Object.entries(config.breakpoint)
    .map(([name, minWidth]) => {
      if (!IDENTIFIER.test(name))
        throw new Error(`Lucente breakpoint "${name}" must be a valid identifier`)
      if (styles[name])
        throw new Error(`Lucente breakpoint "${name}" clashes with an atom name`)
      return { name, minWidth }
    })
    .sort((a, b) => a.minWidth - b.minWidth)

  return { styles, breakpoints }
}

function suffix(name: string) {
  const token = name.startsWith('_') ? name.slice(1) : name
  const normalized = token.replace(/[^A-Za-z0-9_]/g, '_')
  if (!/^[A-Za-z0-9_]+$/.test(normalized))
    throw new Error(`Lucente token "${name}" cannot be used as an atom name`)
  return normalized
}
