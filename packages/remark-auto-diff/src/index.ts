import type { Code, Root } from 'mdast'
import type { Plugin } from 'unified'
import { CONTINUE, visit } from 'unist-util-visit'

import { getDiff } from './libs/diff'

export const remarkAutoDiff: Plugin<[], Root> = function () {
  return (tree) => {
    visit(tree, (node, index, parent) => {
      if (index === undefined || !parent) return CONTINUE
      if (node.type !== 'code') return CONTINUE
      if (!isAutoDiffCodeNode(node)) return CONTINUE

      const nextSibling = parent.children[index + 1]

      if (!nextSibling || nextSibling.type !== 'code' || !isAutoDiffCodeNode(nextSibling))
        throw new Error('Found an `auto-diff` code block not immediately followed by another `auto-diff` code block.')
      if (node.lang !== nextSibling.lang)
        throw new Error('Two `auto-diff` code blocks must use the same language identifier.')

      const diff = getDiff(node.value, nextSibling.value)

      parent.children[index] = {
        ...node,
        lang: 'diff',
        meta: (node.meta?.replace('auto-diff', '') ? node.meta : nextSibling.meta)?.replace(
          'auto-diff',
          `lang=${node.lang}`,
        ),
        value: diff
          .map((line) => `${line.type === 'del' ? '-' : line.type === 'ins' ? '+' : ''}${line.text}`)
          .join('\n'),
      }

      parent.children.splice(index + 1, 1)

      return CONTINUE
    })
  }
}

function isAutoDiffCodeNode(node: Code) {
  return node.meta?.includes('auto-diff')
}
