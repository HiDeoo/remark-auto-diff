import { remark } from 'remark'

import { remarkExpressiveCodeAutoDiff } from '../src'

const processor = remark().use(remarkExpressiveCodeAutoDiff)

export async function renderMarkdown(markdown: string) {
  const { value } = await processor.process(markdown)
  return value
}
