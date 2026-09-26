import assert from 'node:assert/strict'
import test from 'node:test'
import { buildAtoms } from '../dist/compiler.js'
import { emitJs } from '../dist/compiler.js'

test('space tokens become padding atoms', () => {
  const built = buildAtoms({
    space: { md: 12 },
    breakpoint: { md: 768 },
  })

  assert.deepEqual(built.styles.p_md, { padding: 12 })
  assert.deepEqual(built.styles.px_md, { paddingHorizontal: 12 })
  assert.equal(built.styles.w_full.width, '100%')
  assert.deepEqual(built.styles.border.borderWidth, { kind: 'hairline' })
})

test('emitted module keeps hairline and breakpoint bindings', () => {
  const source = emitJs(buildAtoms({
    space: { md: 12 },
    font: { md: { fontSize: 16, lineHeight: 24 } },
    radius: { lg: 16 },
    breakpoint: { md: 768 },
    extend: { card: { backgroundColor: '#182238' } },
  }))

  assert.match(source, /borderWidth: StyleSheet\.hairlineWidth/)
  assert.match(source, /p_md: \{ padding: 12 \}/)
  assert.match(source, /text_md: \{ fontSize: 16, lineHeight: 24 \}/)
  assert.match(source, /rounded_lg: \{ borderRadius: 16 \}/)
  assert.match(source, /card: \{ backgroundColor: "#182238" \}/)
  assert.match(source, /md: bind\(768\)/)
  assert.match(source, /export const useLucente = lucente\.useLucente/)
  assert.match(source, /export const withLucente = lucente\.withLucente/)
})

test('breakpoint names cannot clash with atoms', () => {
  assert.throws(
    () => buildAtoms({
      breakpoint: { flex_1: 10 },
      extend: {},
    }),
    /clashes with an atom/,
  )
})
