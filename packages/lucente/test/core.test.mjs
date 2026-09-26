import assert from 'node:assert/strict'
import test from 'node:test'
import { activeMinWidth, bucketIndex, responsive, selectStyles } from '../dist/core.js'

const points = [
  { name: 'sm', minWidth: 640 },
  { name: 'md', minWidth: 768 },
  { name: 'lg', minWidth: 1024 },
]

test('bucket stays on base below the first breakpoint', () => {
  assert.equal(bucketIndex(390, points), 0)
  assert.equal(activeMinWidth(0, points), -1)
})

test('bucket advances as width crosses breakpoints', () => {
  assert.equal(bucketIndex(640, points), 1)
  assert.equal(bucketIndex(800, points), 2)
  assert.equal(bucketIndex(1400, points), 3)
  assert.equal(activeMinWidth(2, points), 768)
})

test('responsive atoms apply mobile-first and later breakpoints win', () => {
  const base = { width: '100%' }
  const sm = responsive(640, { width: '75%' })
  const md = responsive(768, { width: '50%' })

  assert.deepEqual(selectStyles([base, md, sm], -1), [base])
  assert.deepEqual(selectStyles([base, md, sm], 640), [base, { width: '75%' }])
  assert.deepEqual(selectStyles([base, md, sm], 800), [base, { width: '75%' }, { width: '50%' }])
})

test('false and null parts are skipped', () => {
  const base = { flex: 1 }
  assert.deepEqual(selectStyles([false, null, undefined, base], -1), [base])
})
