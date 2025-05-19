import { expect, test } from 'vitest'

import { getDiff } from '../src/libs/diff'

test('diffs single identical lines', () => {
  expect(getDiff('foo', 'foo')).toEqual([{ text: 'foo' }])
})

test('diffs multiple identical lines', () => {
  expect(getDiff('foo\nfoo\nfoo', 'foo\nfoo\nfoo')).toEqual([{ text: 'foo' }, { text: 'foo' }, { text: 'foo' }])
})

test('diffs single different lines', () => {
  expect(getDiff('foo', 'bar')).toEqual([
    { text: 'foo', type: 'del' },
    { text: 'bar', type: 'ins' },
  ])
})

test('diffs multiple different lines', () => {
  expect(getDiff('foo\nbaz\nfoo', 'bar\nbaz\nbar')).toEqual([
    { text: 'foo', type: 'del' },
    { text: 'bar', type: 'ins' },
    { text: 'baz' },
    { text: 'foo', type: 'del' },
    { text: 'bar', type: 'ins' },
  ])
})
