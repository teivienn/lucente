import type { BuiltAtoms, StyleValue } from './build'

export function emitJs(built: BuiltAtoms): string {
  const entries = Object.entries(built.styles)
    .map(([name, style]) => `  ${name}: {${emitStyle(style)} },`)
    .join('\n')

  const binds = built.breakpoints
    .map(point => `  ${point.name}: bind(${point.minWidth}),`)
    .join('\n')

  const breakpoint = built.breakpoints
    .map(point => `    ${point.name}: ${point.minWidth},`)
    .join('\n')

  return `import { StyleSheet } from 'react-native'
import { createLucente, responsive } from 'lucente/runtime'

const sheet = StyleSheet.create({
${entries}
})

function bind(minWidth) {
  const out = {}
  for (const key of Object.keys(sheet))
    out[key] = responsive(minWidth, sheet[key])
  return out
}

export const atoms = {
  ...sheet,
${binds}
}

const lucente = createLucente({
  breakpoint: {
${breakpoint}
  },
})

export const useLucente = lucente.useLucente
export const withLucente = lucente.withLucente
`
}

export function emitDts(built: BuiltAtoms): string {
  const fields = Object.entries(built.styles)
    .map(([name, style]) => `  ${name}: ${emitStyleType(style)}`)
    .join('\n')

  const names = built.breakpoints.map(point => `'${point.name}'`).join(' | ')
  const breakpoint = names.length > 0 ? names : 'never'

  return `import type { ComponentProps, ComponentRef, ComponentType, ForwardRefExoticComponent, PropsWithoutRef, RefAttributes } from 'react'
import type { StyleProp } from 'react-native'

export type AtomStyle = AtomMap[keyof AtomMap]

export interface ResponsiveAtom<T = AtomStyle> {
  minWidth: number
  style: T
}

export interface AtomMap {
${fields}
}

export type BreakpointName = ${breakpoint}

export type Atoms = AtomMap & {
  [Key in BreakpointName]: { [Name in keyof AtomMap]: ResponsiveAtom<AtomMap[Name]> }
}

export declare const atoms: Atoms

export type LucentePart = AtomStyle | ResponsiveAtom | false | null | undefined

export type ResolvedStyle = StyleProp<any>

export declare function useLucente(...parts: LucentePart[]): ResolvedStyle

export declare function withLucente<C extends ComponentType<any>>(
  Component: C,
  ...parts: LucentePart[]
): ForwardRefExoticComponent<PropsWithoutRef<ComponentProps<C>> & RefAttributes<ComponentRef<C>>>
`
}

function emitStyleType(style: Record<string, StyleValue>): string {
  const fields = Object.entries(style)
    .map(([key, value]) => `${key}: ${emitTypeOf(value)}`)
    .join('; ')
  return `{ ${fields} }`
}

function emitTypeOf(value: StyleValue): string {
  if (typeof value === 'string')
    return JSON.stringify(value)
  return 'number'
}

function emitStyle(style: Record<string, StyleValue>): string {
  return Object.entries(style)
    .map(([prop, value]) => ` ${prop}: ${emitValue(value)}`)
    .join(',')
}

function emitValue(value: StyleValue): string {
  if (typeof value === 'object')
    return 'StyleSheet.hairlineWidth'
  if (typeof value === 'string')
    return JSON.stringify(value)
  return String(value)
}
