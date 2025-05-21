// @ts-check
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import { remarkAutoDiff } from 'remark-auto-diff'

export default defineConfig({
  integrations: [
    starlight({
      description: 'A remark plugin providing an alternative syntax to author diff code blocks in Markdown.',
      editLink: {
        baseUrl: 'https://github.com/HiDeoo/remark-auto-diff/edit/main/docs/',
      },
      sidebar: [
        {
          label: 'Start Here',
          items: ['getting-started', 'why'],
        },
        'demo',
      ],
      social: [
        { href: 'https://bsky.app/profile/hideoo.dev', icon: 'blueSky', label: 'Bluesky' },
        { href: 'https://github.com/HiDeoo/remark-auto-diff', icon: 'github', label: 'GitHub' },
      ],
      title: 'remark-auto-diff',
    }),
  ],
  markdown: {
    remarkPlugins: [remarkAutoDiff],
  },
  site: 'https://remark-auto-diff.netlify.app/',
  trailingSlash: 'always',
})
