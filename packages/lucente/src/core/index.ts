export const RESPONSIVE = Symbol.for('lucente.responsive')

export type StyleAtom = Record<string, unknown>

export interface ResponsiveAtom {
  [RESPONSIVE]: true
  minWidth: number
  style: StyleAtom
}

export type LucentePart = StyleAtom | ResponsiveAtom | false | null | undefined

export interface Breakpoint {
  name: string
  minWidth: number
}

export function responsive(minWidth: number, style: StyleAtom): ResponsiveAtom {
  return {
    [RESPONSIVE]: true,
    minWidth,
    style,
  }
}

export function isResponsiveAtom(part: unknown): part is ResponsiveAtom {
  return typeof part === 'object' && part !== null && RESPONSIVE in part
}

export function orderedBreakpoints(map: Record<string, number>): Breakpoint[] {
  return Object.entries(map)
    .map(([name, minWidth]) => ({ name, minWidth }))
    .sort((a, b) => a.minWidth - b.minWidth)
}

export function bucketIndex(width: number, points: readonly Breakpoint[]): number {
  let bucket = 0
  for (let index = 0; index < points.length; index += 1) {
    const point = points[index]
    if (point && width >= point.minWidth)
      bucket = index + 1
  }
  return bucket
}

export function activeMinWidth(bucket: number, points: readonly Breakpoint[]): number {
  if (bucket <= 0)
    return -1
  return points[bucket - 1]?.minWidth ?? -1
}

export function hasResponsive(parts: readonly LucentePart[]): boolean {
  return parts.some(part => isResponsiveAtom(part))
}

export function selectStyles(parts: readonly LucentePart[], minWidth: number): StyleAtom[] {
  const base: StyleAtom[] = []
  const matched: ResponsiveAtom[] = []

  for (const part of parts) {
    if (part == null || part === false)
      continue
    if (isResponsiveAtom(part)) {
      if (part.minWidth <= minWidth)
        matched.push(part)
      continue
    }
    base.push(part)
  }

  matched.sort((a, b) => a.minWidth - b.minWidth)
  return [...base, ...matched.map(part => part.style)]
}
