import { definePlugin, type ExpressiveCodeBlock } from '@expressive-code/core'

import { AutoDiffAnnotation } from './libs/annotations'
import { getDiff, type Diff } from './libs/diff'

const autoDiffAnnotationRegex = /(---\[diff]---)/g

export function pluginAutoDiff() {
  return definePlugin({
    name: 'AutoDiff',
    hooks: {
      preprocessLanguage: ({ codeBlock }) => {
        if (!isAutoDiffCodeBlock(codeBlock)) return

        codeBlock.props.useDiffSyntax = true
      },
      preprocessCode: ({ codeBlock }) => {
        // TODO(HiDeoo) disable annotation ???? What did I mean?
        if (!isAutoDiffCodeBlock(codeBlock)) return

        let isAnnotated = false
        const oldLines: string[] = []
        const newLines: string[] = []

        const lines = codeBlock.getLines()

        for (const line of lines) {
          const matches = line.text.match(autoDiffAnnotationRegex)

          if (!matches) {
            if (isAnnotated) newLines.push(line.text)
            else oldLines.push(line.text)
            continue
          }

          if (matches.length > 1 || isAnnotated) {
            // TODO(HiDeoo) Improve error
            // TODO(HiDeoo) mention marker to disable
            throw new Error('Multiple auto-diff annotations found in the same code block.')
          }

          isAnnotated = true
        }

        if (!isAnnotated) return

        codeBlock.deleteLines(Array.from({ length: lines.length }, (_, i) => i))

        const diff = getDiff(oldLines.join('\n'), newLines.join('\n'))
        if (diff.length === 0) return

        insertAutoDiff(codeBlock, diff)
      },
    },
  })
}

function isAutoDiffCodeBlock(codeBlock: ExpressiveCodeBlock) {
  const isAutoDiff = codeBlock.code.match(autoDiffAnnotationRegex)
  autoDiffAnnotationRegex.lastIndex = 0
  return isAutoDiff
}

function insertAutoDiff(codeBlock: ExpressiveCodeBlock, diff: Diff) {
  let lineIndex = 0

  for (const diffLine of diff) {
    const line = codeBlock.insertLine(lineIndex++, diffLine.text)
    if (diffLine.type) line.addAnnotation(new AutoDiffAnnotation({}, diffLine.type))
  }
}

declare module '@expressive-code/core' {
  export interface ExpressiveCodeBlockProps {
    useDiffSyntax?: boolean
  }
}
