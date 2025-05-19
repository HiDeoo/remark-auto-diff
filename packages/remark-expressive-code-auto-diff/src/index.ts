import type { Root, Code } from 'mdast'
import type { Plugin } from 'unified'
import { CONTINUE, SKIP, visit } from 'unist-util-visit'

import { getDiff } from './libs/diff'

export const remarkExpressiveCodeAutoDiff: Plugin<[], Root> = function () {
  return (tree) => {
    let before: Code | undefined

    visit(tree, (node, index, parent) => {
      if (index === undefined || !parent) return CONTINUE
      if (node.type !== 'code') return CONTINUE
      // TODO(HiDeoo) extra meta, should check if it's contained in meta, not if it's equal
      if (node.meta !== 'auto-diff') return CONTINUE

      if (!before) {
        before = node
        return SKIP
      }

      // TODO(HiDeoo) errors (no-after-after-before, no-before-before-after)
      // TODO(HiDeoo) remove `auto-diff` from meta

      const diff = getDiff(before.value, node.value)

      parent.children[index - 1] = {
        ...before,
        lang: 'diff',
        // TODO(HiDeoo) handle meta
        meta: before.meta?.replace('auto-diff', `lang=${before.lang}`),
        value: diff
          .map((line) => `${line.type === 'del' ? '-' : line.type === 'ins' ? '+' : ''}${line.text}`)
          .join('\n'),
      }

      parent.children.splice(index, 1)
      before = undefined

      return SKIP
    })
  }
}
