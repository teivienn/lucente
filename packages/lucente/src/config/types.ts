export interface FontAtom {
  fontSize: number
  lineHeight: number
}

export interface LucenteConfig {
  space: Record<string, number>
  font: Record<string, FontAtom>
  radius: Record<string, number>
  breakpoint: Record<string, number>
  extend: Record<string, Record<string, string | number>>
}

export type LucenteConfigInput = {
  [Key in keyof LucenteConfig]?: LucenteConfig[Key]
}
