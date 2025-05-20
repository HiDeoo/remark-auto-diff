import type { Code, Root } from 'mdast'
import type { Plugin } from 'unified'
import { CONTINUE, SKIP, visit } from 'unist-util-visit'

import { getDiff } from './libs/diff'

export const remarkExpressiveCodeAutoDiff: Plugin<[], Root> = function () {
  return (tree) => {
    let before: Code | undefined

    visit(tree, (node, index, parent) => {
      if (before) {
        // TODO(HiDeoo) error message
        if (node.type !== 'code') throw new Error('Expected a code node')
        // TODO(HiDeoo) error message
        if (!isAutoDiffCodeNode(node)) throw new Error('Expected an auto-diff code node')
      }

      if (index === undefined || !parent) return CONTINUE
      if (node.type !== 'code') return CONTINUE
      if (!isAutoDiffCodeNode(node)) return CONTINUE

      if (!before) {
        before = node
        return SKIP
      }

      const diff = getDiff(before.value, node.value)

      parent.children[index - 1] = {
        ...before,
        lang: 'diff',
        meta: before.meta?.replace('auto-diff', `lang=${before.lang}`),
        value: diff
          .map((line) => `${line.type === 'del' ? '-' : line.type === 'ins' ? '+' : ''}${line.text}`)
          .join('\n'),
      }

      parent.children.splice(index, 1)
      before = undefined

      return SKIP
    })

    if (before) {
      // TODO(HiDeoo) error message
      throw new Error('Expected an auto-diff code node')
    }
  }
}

function isAutoDiffCodeNode(node: Code) {
  return node.meta?.includes('auto-diff')
}
