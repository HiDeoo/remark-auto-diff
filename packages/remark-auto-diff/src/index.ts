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

      // TODO(HiDeoo) error message
      // TODO(HiDeoo) expected X but found Y
      if (!nextSibling) throw new Error('Expected an auto-diff code node but found nothing')
      if (nextSibling.type !== 'code') throw new Error('Expected a code node')
      if (!isAutoDiffCodeNode(nextSibling)) throw new Error('Expected an auto-diff code node')
      if (node.lang !== nextSibling.lang) throw new Error('Expected an auto-diff code node with the same language')

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
