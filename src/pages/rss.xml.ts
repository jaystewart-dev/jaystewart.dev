import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { absolute, site } from '../data/site.ts';

/**
 * RSS feed of the notes.
 *
 * Notes are the only content with a publication date, which makes them the
 * only content a feed reader can order honestly — case studies are living
 * documents that get re-edited as the systems change, so a `pubDate` on them
 * would be a small lie every time one was revised.
 *
 * The description is the note's own description, not the body: the feed is a
 * notification channel, and the site is where the diagrams and figures render
 * properly.
 */
export async function GET(context: APIContext) {
  const notes = (await getCollection('notes', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  return rss({
    title: `${site.name} — Notes`,
    description:
      'Short engineering write-ups: individual problems worth writing down, usually because the obvious solution was wrong or the failure mode was invisible.',
    site: context.site ?? site.origin,
    items: notes.map((note) => ({
      title: note.data.title,
      description: note.data.description,
      pubDate: note.data.date,
      link: `/notes/${note.id}/`,
      categories: [note.data.topic],
    })),
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: [
      '<language>en-GB</language>',
      // The self-reference the RSS board's best-practice profile asks for;
      // feed validators warn without it.
      `<atom:link href="${absolute('/rss.xml')}" rel="self" type="application/rss+xml"/>`,
    ].join(''),
  });
}
