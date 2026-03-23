import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const pages = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		eyebrow: z.string().optional(),
		hero: z
			.object({
				eyebrow: z.string(),
				title: z.string(),
				subtitle: z.string(),
				intro: z.string(),
				primaryCta: z.object({
					label: z.string(),
					href: z.string(),
				}),
				secondaryCta: z.object({
					label: z.string(),
					href: z.string(),
				}),
			})
			.optional(),
		intro: z
			.object({
				eyebrow: z.string(),
				heading: z.string(),
				paragraphs: z.tuple([z.string(), z.string()]),
			})
			.optional(),
		themes: z
			.object({
				eyebrow: z.string(),
				heading: z.string(),
				cards: z.array(
					z.object({
						title: z.string(),
						text: z.string(),
					}),
				),
			})
			.optional(),
		relevance: z
			.object({
				eyebrow: z.string(),
				heading: z.string(),
				paragraph: z.string(),
				closing: z.string(),
			})
			.optional(),
	}),
});

export const collections = { pages };
