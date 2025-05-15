// @ts-check
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'

export default defineConfig({
  integrations: [
    starlight({
      description: '// TODO(HiDeoo) ',
      editLink: {
        baseUrl: 'https://github.com/HiDeoo/expressive-code-auto-diff/edit/main/docs/',
      },
      // TODO(HiDeoo) sidebar
      social: [
        { href: 'https://bsky.app/profile/hideoo.dev', icon: 'blueSky', label: 'Bluesky' },
        { href: 'https://github.com/HiDeoo/expressive-code-auto-diff', icon: 'github', label: 'GitHub' },
      ],
      title: '// TODO(HiDeoo) ',
    }),
  ],
  site: 'https://expressive-code-auto-diff.netlify.app/',
  trailingSlash: 'always',
})
