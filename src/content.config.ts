import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// News posts: one Markdown file per post in src/content/news (see README.md).
const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    /** Optional image in media/ (public/media), for the post's link preview. */
    image: z.string().optional(),
    /** Drafts are left out of the build. */
    draft: z.boolean().default(false),
    /** About the story campaign: built only with SHOW_CAMPAIGN=1 (until the 1.0 release). */
    campaign: z.boolean().default(false),
  }),
});

export const collections = { news };
