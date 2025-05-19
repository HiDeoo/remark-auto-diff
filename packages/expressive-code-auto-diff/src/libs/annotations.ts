import {
  ExpressiveCodeAnnotation,
  type AnnotationBaseOptions,
  type AnnotationRenderOptions,
} from '@expressive-code/core'
import { addClassName, type Parents } from '@expressive-code/core/hast'

import type { DiffType } from './diff'

export class AutoDiffAnnotation extends ExpressiveCodeAnnotation {
  constructor(
    options: AnnotationBaseOptions,
    private diffType: NonNullable<DiffType>,
  ) {
    super(options)
  }

  override render({ nodesToTransform }: AnnotationRenderOptions): Parents[] {
    return nodesToTransform.map((node) => {
      if (node.type === 'element') {
        addClassName(node, 'highlight')
        addClassName(node, this.diffType)
      }

      return node
    })
  }
}
