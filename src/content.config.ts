import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const grimorio = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/grimorio' }),
  schema: z.object({
    title: z.string(),
    module: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    progress: z.number().min(0).max(100).default(0),
    draft: z.boolean().default(false),
    conjuro: z.string().optional(),
    order: z.number().optional(),
  }),
});

const proyectos = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/proyectos' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    repo: z.string().optional(),
    demo: z.string().optional(),
    status: z.enum(['planning', 'active', 'complete']).default('planning'),
    stack: z.array(z.string()).default([]),
    thumbnail: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const diario = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/diario' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    excerpt: z.string().optional(),
  }),
});

export const collections = { grimorio, proyectos, diario };
