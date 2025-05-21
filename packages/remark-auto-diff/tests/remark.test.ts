import { describe, expect, test } from 'vitest'

import { renderMarkdown } from './utils'

describe('transforms auto-diff syntax', () => {
  test('does not transform non auto-diff syntax', async () => {
    const md = await renderMarkdown(`\`\`\`js
foo
\`\`\`

\`\`\`js
bar
\`\`\``)

    expect(md).toMatchInlineSnapshot(`
      "\`\`\`js
      foo
      \`\`\`

      \`\`\`js
      bar
      \`\`\`
      "
    `)
  })

  test('transforms basic auto-diff syntax', async () => {
    const md = await renderMarkdown(`\`\`\`js auto-diff
foo
\`\`\`

\`\`\`js auto-diff
bar
\`\`\``)

    expect(md).toMatchInlineSnapshot(`
    "\`\`\`diff lang=js
    -foo
    +bar
    \`\`\`
    "
  `)
  })

  test('respects indentations', async () => {
    const md = await renderMarkdown(`\`\`\`js auto-diff
foo(() => {
  console.log('foo')
})
\`\`\`

\`\`\`js auto-diff
bar(() => {
    console.log('bar')
})
\`\`\``)

    expect(md).toMatchInlineSnapshot(`
      "\`\`\`diff lang=js
      -foo(() => {
      -  console.log('foo')
      +bar(() => {
      +    console.log('bar')
      })
      \`\`\`
      "
    `)
  })

  test('transforms multiple auto-diff syntax', async () => {
    const md = await renderMarkdown(`\`\`\`js auto-diff
foo
\`\`\`

\`\`\`js auto-diff
bar
\`\`\`

\`\`\`js auto-diff
qux
\`\`\`

\`\`\`js auto-diff
quxx
\`\`\``)

    expect(md).toMatchInlineSnapshot(`
      "\`\`\`diff lang=js
      -foo
      +bar
      \`\`\`

      \`\`\`diff lang=js
      -qux
      +quxx
      \`\`\`
      "
    `)
  })

  test('transforms auto-diff syntax in nested nodes', async () => {
    const md = await renderMarkdown(`- test 1

  \`\`\`js auto-diff
  foo
  \`\`\`

  \`\`\`js auto-diff
  bar
  \`\`\`

  - test 2`)

    expect(md).toMatchInlineSnapshot(`
      "* test 1

        \`\`\`diff lang=js
        -foo
        +bar
        \`\`\`

        * test 2
      "
    `)
  })

  test('transforms auto-diff syntax with other meta informations', async () => {
    const md = await renderMarkdown(`\`\`\`js title="test.js" auto-diff
foo
\`\`\`

\`\`\`js auto-diff
bar
\`\`\``)

    expect(md).toMatchInlineSnapshot(`
    "\`\`\`diff title="test.js" lang=js
    -foo
    +bar
    \`\`\`
    "
  `)
  })

  test('uses meta informations from the before auto-diff code block in priority', async () => {
    const md = await renderMarkdown(`\`\`\`js auto-diff title="before.js"
foo
\`\`\`

\`\`\`js auto-diff title="after.js"
bar
\`\`\``)

    expect(md).toMatchInlineSnapshot(`
    "\`\`\`diff lang=js title="before.js"
    -foo
    +bar
    \`\`\`
    "
  `)
  })

  test('fallbacks to the meta informations from the after auto-diff code block', async () => {
    const md = await renderMarkdown(`\`\`\`js auto-diff
foo
\`\`\`

\`\`\`js auto-diff title="test.js"
bar
\`\`\``)

    expect(md).toMatchInlineSnapshot(`
    "\`\`\`diff lang=js title="test.js"
    -foo
    +bar
    \`\`\`
    "
  `)
  })

  test('transforms auto-diff syntax with no before', async () => {
    const md = await renderMarkdown(`\`\`\`js auto-diff
\`\`\`

\`\`\`js auto-diff
bar
\`\`\``)

    expect(md).toMatchInlineSnapshot(`
      "\`\`\`diff lang=js
      +bar
      \`\`\`
      "
    `)
  })

  test('transforms auto-diff syntax with no after', async () => {
    const md = await renderMarkdown(`\`\`\`js auto-diff
foo
\`\`\`

\`\`\`js auto-diff
\`\`\``)

    expect(md).toMatchInlineSnapshot(`
      "\`\`\`diff lang=js
      -foo
      \`\`\`
      "
    `)
  })

  test('respects empty lines in auto-diff syntax', async () => {
    const md = await renderMarkdown(`\`\`\`js auto-diff

foo

bar

\`\`\`

\`\`\`js auto-diff

baz

qux

\`\`\``)

    expect(md).toMatchInlineSnapshot(`
      "\`\`\`diff lang=js

      -foo
      +baz

      -bar
      +qux

      \`\`\`
      "
    `)
  })
})

describe('reports syntax errors', () => {
  test('reports an auto-diff code block not followed by another code block', async () => {
    await expect(() =>
      renderMarkdown(`\`\`\`js auto-diff
foo
\`\`\`

bar`),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Found an \`auto-diff\` code block not immediately followed by another \`auto-diff\` code block.]`,
    )
  })

  test('reports an auto-diff code block not followed by another auto-diff code block', async () => {
    await expect(() =>
      renderMarkdown(`\`\`\`js auto-diff
foo
\`\`\`

\`\`\`js
bar
\`\`\``),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Found an \`auto-diff\` code block not immediately followed by another \`auto-diff\` code block.]`,
    )
  })

  test('reports an auto-diff code block not followed by another auto-diff code block at the same depth', async () => {
    await expect(() =>
      renderMarkdown(`- test 1
  \`\`\`js auto-diff
  foo
  \`\`\`

\`\`\`js auto-diff
bar
\`\`\``),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Found an \`auto-diff\` code block not immediately followed by another \`auto-diff\` code block.]`,
    )
  })

  test('reports an auto-diff code block not followed by any node', async () => {
    await expect(() =>
      renderMarkdown(`\`\`\`js auto-diff
foo
\`\`\``),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Found an \`auto-diff\` code block not immediately followed by another \`auto-diff\` code block.]`,
    )
  })

  test('reports auto-diff code blocks with different languages', async () => {
    await expect(() =>
      renderMarkdown(`\`\`\`js auto-diff
foo
\`\`\`

\`\`\`ts auto-diff
bar
\`\`\``),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Two \`auto-diff\` code blocks must use the same language identifier.]`,
    )
  })
})
