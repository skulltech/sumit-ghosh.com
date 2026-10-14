import { getCollection, type CollectionEntry } from 'astro:content';

export async function getPosts() {
  return (await getCollection('posts')).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function formatDate(date: Date, style: 'full' | 'short' = 'full') {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric', month: 'short', ...(style === 'full' && { year: 'numeric' }), timeZone: 'Asia/Kolkata',
  }).format(date);
}

export function postYear(date: Date) {
  return Number(new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: 'Asia/Kolkata' }).format(date));
}

export function readingTime(post: CollectionEntry<'posts'>) {
  return Math.max(1, Math.ceil((post.body ?? '').split(/\s+/).length / 220));
}
