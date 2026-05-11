import type { Metadata } from 'next';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { marked, Renderer } from 'marked';
import MermaidHydrator from '@/components/MermaidHydrator';

export const metadata: Metadata = {
  title: 'Whitepaper',
  description:
    'PeerPulse v7.0 whitepaper: a peer-to-peer protocol for election verification, civic surveys, government-proceedings extraction, and civic education.',
  alternates: { canonical: 'https://peerpulse.app/whitepaper' },
};

export const dynamic = 'force-static';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function loadWhitepaper(): Promise<string> {
  const file = path.join(process.cwd(), '..', '..', 'docs', 'product', 'whitepaper.md');
  const md = await readFile(file, 'utf8');

  const renderer = new Renderer();
  const baseCode = renderer.code.bind(renderer);
  renderer.code = (token) => {
    if (token.lang === 'mermaid') {
      return `<div class="mermaid">${escapeHtml(token.text)}</div>`;
    }
    return baseCode(token);
  };

  marked.use({ renderer, gfm: true });
  return marked.parse(md, { async: false }) as string;
}

export default async function WhitepaperPage() {
  const html = await loadWhitepaper();
  return (
    <article className="wp">
      <div className="wp-inner" dangerouslySetInnerHTML={{ __html: html }} />
      <MermaidHydrator />
    </article>
  );
}
