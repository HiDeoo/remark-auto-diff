import { remark } from 'remark'

import { remarkAutoDiff } from '../src'

const processor = remark().use(remarkAutoDiff)

export async function renderMarkdown(markdown: string) {
  const { value } = await processor.process(markdown)
  return value
}
