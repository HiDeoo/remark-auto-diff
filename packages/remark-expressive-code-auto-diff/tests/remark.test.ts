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
})

describe('reports syntax errors', () => {
  test('reports an auto-diff code block not followed by another code block', async () => {
    await expect(() =>
      renderMarkdown(`\`\`\`js auto-diff
foo
\`\`\`

bar`),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Expected a code node]`)
  })

  test('reports an auto-diff code block not followed by another auto-diff code block', async () => {
    await expect(() =>
      renderMarkdown(`\`\`\`js auto-diff
foo
\`\`\`

\`\`\`js
bar
\`\`\``),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Expected an auto-diff code node]`)
  })

  test('reports an auto-diff code block not followed by any node', async () => {
    await expect(() =>
      renderMarkdown(`\`\`\`js auto-diff
foo
\`\`\``),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Expected an auto-diff code node but found nothing]`)
  })
})

// TODO(HiDeoo) test in nested markdup, e.g. in a list
// TODO(HiDeoo) test in different nested markdup, e.g. in a list child and then back at the root
