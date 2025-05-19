import { diffLinesRaw } from 'jest-diff'

export function getDiff(a: string, b: string): Diff {
  const diff = diffLinesRaw(splitLines(a), splitLines(b))

  return diff.map((line) => {
    const diffLine: DiffLine = { text: line[1], type: undefined }

    if (line[0] === -1) diffLine.type = 'del'
    else if (line[0] === 1) diffLine.type = 'ins'

    return diffLine
  })
}

function splitLines(text: string) {
  return text.length === 0 ? [] : text.split('\n')
}

export type DiffType = 'del' | 'ins' | undefined

interface DiffLine {
  text: string
  type: DiffType
}

export type Diff = DiffLine[]
