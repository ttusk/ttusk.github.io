import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    tldr: z.boolean().default(false),
    date: z.coerce.date(),
    publishDate: z.coerce.date(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
  }),
});

const updates = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/updates" }),
  schema: z.object({
    date: z.coerce.date(),
    update: z.string(),
    internal: z.boolean().default(false),
  }),
});

const experiences = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/experiences" }),
  schema: z.object({
    title: z.string(),
    organization: z.string(),
    period: z.string(),
    bullets: z.array(z.string()),
  }),
});

export const collections = { posts, updates, experiences };
