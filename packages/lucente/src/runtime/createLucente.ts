import { createElement, forwardRef, useSyncExternalStore, type ComponentType, type ForwardedRef } from 'react'
import { Dimensions, StyleSheet, type ViewStyle } from 'react-native'
import {
  activeMinWidth,
  bucketIndex,
  hasResponsive,
  orderedBreakpoints,
  RESPONSIVE,
  responsive,
  selectStyles,
  type Breakpoint,
  type LucentePart,
  type StyleAtom,
} from '../core'

export { RESPONSIVE, responsive }
export type { LucentePart, ResponsiveAtom, StyleAtom } from '../core'

export interface CreateLucenteOptions {
  breakpoint: Record<string, number>
  getWidth?: () => number
  subscribeWidth?: (onChange: (width: number) => void) => () => void
}

const EMPTY: StyleAtom = {}
const noopSubscribe = () => () => {}

export function createLucente(options: CreateLucenteOptions) {
  const points = orderedBreakpoints(options.breakpoint)
  const getWidth = options.getWidth ?? (() => Dimensions.get('window').width)
  const subscribeWidth = options.subscribeWidth ?? ((onChange) => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: { width: number } }) => {
      onChange(window.width)
    })
    return () => subscription.remove()
  })

  let bucket = bucketIndex(readWidth(getWidth), points)
  const listeners = new Set<() => void>()
  let started = false

  function start() {
    if (started)
      return
    started = true
    bucket = bucketIndex(readWidth(getWidth), points)
    subscribeWidth(applyWidth)
  }

  function applyWidth(nextWidth: number) {
    const next = bucketIndex(nextWidth, points)
    if (next === bucket)
      return
    bucket = next
    for (const listener of listeners)
      listener()
  }

  function subscribe(listener: () => void) {
    start()
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  function getSnapshot() {
    return bucket
  }

  const cache = new Map<unknown, CacheNode>()

  function useLucente(...parts: LucentePart[]): ViewStyle {
    const responsive = hasResponsive(parts)
    const current = useSyncExternalStore(
      responsive ? subscribe : noopSubscribe,
      () => (responsive ? getSnapshot() : 0),
      () => (responsive ? getSnapshot() : 0),
    )
    return readStyle(cache, parts, responsive ? current : 0, points) as ViewStyle
  }

  function withLucente<C extends ComponentType<any>>(Component: C, ...parts: LucentePart[]) {
    const Wrapped = forwardRef((props: { style?: ViewStyle } & Record<string, unknown>, ref: ForwardedRef<unknown>) => {
      const { style, ...rest } = props
      const base = useLucente(...parts)
      const merged = style == null ? base : StyleSheet.compose(base, style)
      return createElement(Component, { ...rest, ref, style: merged })
    })

    const componentName = componentLabel(Component)
    Wrapped.displayName = `withLucente(${componentName})`
    return Wrapped
  }

  return { useLucente, withLucente }
}

interface CacheNode {
  children: Map<unknown, CacheNode>
  styles: Map<number, StyleAtom>
}

function readStyle(
  cache: Map<unknown, CacheNode>,
  parts: readonly LucentePart[],
  bucket: number,
  points: readonly Breakpoint[],
) {
  let node = nodeFor(cache, parts)
  const cached = node.styles.get(bucket)
  if (cached)
    return cached

  const selected = selectStyles(parts, activeMinWidth(bucket, points))
  const style = selected.length === 0 ? EMPTY : selected.length === 1 ? selected[0]! : StyleSheet.flatten(selected) as StyleAtom
  node.styles.set(bucket, style)
  return style
}

function nodeFor(cache: Map<unknown, CacheNode>, parts: readonly LucentePart[]) {
  let children = cache
  let node: CacheNode = { children, styles: new Map() }

  for (const part of parts) {
    const found = children.get(part)
    if (found) {
      node = found
    }
    else {
      node = { children: new Map(), styles: new Map() }
      children.set(part, node)
    }
    children = node.children
  }

  if (parts.length === 0) {
    const root = children.get(ROOT)
    if (root)
      return root
    node = { children: new Map(), styles: new Map() }
    children.set(ROOT, node)
  }

  return node
}

const ROOT = Symbol('lucente.cache.root')

function readWidth(getWidth: () => number) {
  try {
    return getWidth()
  }
  catch {
    return 0
  }
}

function componentLabel(Component: ComponentType<any>) {
  if (typeof Component === 'function')
    return Component.displayName || Component.name || 'Component'
  return 'Component'
}
