import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../lib/posts';

export async function GET(context: APIContext) {
  return rss({
    title: "Sumit's Space",
    description: 'Writing by Sumit Ghosh on AI engineering, software, and building things.',
    site: context.site!,
    items: (await getPosts()).map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description ?? `${post.data.title} — by Sumit Ghosh.`,
      link: `/posts/${post.id}/`,
      content: post.rendered?.html.replace(/(href|src)="\/(?!\/)/g, `$1="${context.site}`),
    })),
  });
}
