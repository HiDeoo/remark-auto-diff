import {
  definePlugin,
  ExpressiveCodeAnnotation,
  type AnnotationBaseOptions,
  type AnnotationRenderOptions,
  type ExpressiveCodeBlock,
} from '@expressive-code/core'
import { addClassName, type Parents } from '@expressive-code/core/hast'
import gitDiff from 'git-diff'

const autoDiffAnnotationRegex = /(---\[diff]---)/g
const diffLineRegex = /^(?<marker>[+-](?![+-]))?\s*(?<content>.*)$/

export function pluginAutoDiff() {
  return definePlugin({
    name: 'AutoDiff',
    hooks: {
      preprocessLanguage: ({ codeBlock }) => {
        if (!isAutoDiffCodeBlock(codeBlock)) return

        // TODO(HiDeoo)
        const language = codeBlock.language
        codeBlock.language = 'diff'
        // TODO(HiDeoo) existing lang
        // TODO(HiDeoo) remove title
        // codeBlock.meta = `lang=js title="test.js"`
      },
      preprocessCode: ({ codeBlock }) => {
        // TODO(HiDeoo) disable annotation
        if (!isAutoDiffCodeBlock(codeBlock)) return

        let foundAnnotation = false
        const oldLines: string[] = []
        const newLines: string[] = []

        const lines = codeBlock.getLines()

        for (const line of lines) {
          const matches = line.text.match(autoDiffAnnotationRegex)

          if (!matches) {
            if (foundAnnotation) {
              newLines.push(line.text)
            } else {
              oldLines.push(line.text)
            }
            continue
          }

          if (matches.length > 1 || foundAnnotation) {
            // TODO(HiDeoo) Improve error
            // TODO(HiDeoo) mention marker to disable
            throw new Error('Multiple auto-diff annotations found in the same code block.')
          }

          foundAnnotation = true
        }

        if (!foundAnnotation) return

        codeBlock.deleteLines(Array.from({ length: lines.length }, (_, i) => i))

        // TODO(HiDeoo) words?

        const diff = gitDiff(oldLines.join('\n'), newLines.join('\n'), { noHeaders: true, wordDiff: true })
        if (!diff) return

        console.log('🚨 [index.ts:60] diff:', diff)

        insertAutoDiff(codeBlock, diff.split('\n'))
      },
    },
  })
}

function isAutoDiffCodeBlock(codeBlock: ExpressiveCodeBlock) {
  const isAutoDiff = codeBlock.code.match(autoDiffAnnotationRegex)
  autoDiffAnnotationRegex.lastIndex = 0
  return isAutoDiff
}

// TODO(HiDeoo) comment
function insertAutoDiff(codeBlock: ExpressiveCodeBlock, diff: string[]) {
  let lineIndex = 0

  for (const [index, entry] of diff.entries()) {
    if (entry === String.raw`\ No newline at end of file`) continue
    if (!entry && index === diff.length - 1) continue

    const markerType: MarkerType | undefined = entry.startsWith('+') ? 'ins' : entry.startsWith('-') ? 'del' : undefined
    const content = markerType ? entry.slice(1) : entry

    const line = codeBlock.insertLine(lineIndex++, content)

    // TODO(HiDeoo) move
    class Plop extends ExpressiveCodeAnnotation {
      constructor(
        options: AnnotationBaseOptions,
        private markerType: MarkerType,
      ) {
        super(options)
      }

      override render({ nodesToTransform, line, lineIndex }: AnnotationRenderOptions): Parents[] {
        return nodesToTransform.map((node, idx) => {
          // const transformedNode = h(this.markerType, node)
          if (node.type === 'element') {
            addClassName(node, 'highlight')
            addClassName(node, this.markerType)
          }
          return node

          // if (nodesToTransform.length > 0 && idx > 0) {
          //   addClassName(transformedNode, 'open-start')
          // }
          // if (nodesToTransform.length > 0 && idx < nodesToTransform.length - 1) {
          //   addClassName(transformedNode, 'open-end')
          // }
          // return transformedNode
        })
      }
    }

    if (markerType) {
      line.addAnnotation(
        new Plop({}, markerType),
        // new TextMarkerAnnotation({
        //   markerType,
        //   backgroundColor: cssVar(markerBgColorPaths[markerType]),
        // }),
      )
    }
  }

  // const linesAndMarkers = lines.map((line) => {
  //   const match = diffLineRegex.exec(line)
  //   const { content = '', marker, indentation = '' } = match?.groups ?? {}
  //   const markerType: MarkerType | undefined = marker === '+' ? 'ins' : marker === '-' ? 'del' : undefined

  //   // Remember the minimum indentation of non-empty lines.
  //   if (content.trim().length > 0 && indentation.length < minIndentation) minIndentation = indentation.length

  //   return { line, markerType }
  // })

  // let lineIndex = 0

  // for (const { line, markerType } of linesAndMarkers) {
  //   const colsToRemove = minIndentation || (markerType ? 1 : 0)
  //   if (colsToRemove > 0) line.editText(0, colsToRemove, '')
  // }

  // for (const line of lines) {
  //   if (!line || line === String.raw`\ No newline at end of file`) continue
  //   codeBlock.insertLine(lineIndex++, line)
  // }
}

type MarkerType = 'ins' | 'del'
