// @ts-check
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import { remarkAutoDiff } from 'remark-auto-diff'

export default defineConfig({
  integrations: [
    starlight({
      description: '// TODO(HiDeoo) ',
      editLink: {
        baseUrl: 'https://github.com/HiDeoo/remark-auto-diff/edit/main/docs/',
      },
      // TODO(HiDeoo) sidebar
      social: [
        { href: 'https://bsky.app/profile/hideoo.dev', icon: 'blueSky', label: 'Bluesky' },
        { href: 'https://github.com/HiDeoo/remark-auto-diff', icon: 'github', label: 'GitHub' },
      ],
      title: '// TODO(HiDeoo) ',
    }),
  ],
  markdown: {
    remarkPlugins: [remarkAutoDiff],
  },
  site: 'https://remark-auto-diff.netlify.app/',
  trailingSlash: 'always',
})
