// @ts-check
import { defineEcConfig } from '@astrojs/starlight/expressive-code'
import { pluginAutoDiff } from 'expressive-code-auto-diff'

export default defineEcConfig({
  plugins: [pluginAutoDiff()],
})
