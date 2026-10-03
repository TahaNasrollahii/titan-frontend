const fs = require('fs');

const htmlContent = fs.readFileSync('titan.html', 'utf8');
const htmlBodyMatch = htmlContent.match(/<body>([\s\S]*?)<script>/);
if (!htmlBodyMatch) {
    console.error("Could not find body HTML");
    process.exit(1);
}
const rawHtml = htmlBodyMatch[1].replace(/`/g, '\\`');

const jsContent = fs.readFileSync('src/app/titan.js', 'utf8');

// Replace the constants in JS with dynamic data
const dynamicJsContent = jsContent
    .replace('const SLIDES = [', 'const SLIDES = window.__TITAN_DATA.slides || [')
    .replace('const PICKS = [', 'const PICKS = window.__TITAN_DATA.picks || [')
    .replace('const GAMES = [', 'const GAMES = window.__TITAN_DATA.games || [');


const pageTsx = `
'use client';

import { useEffect, useRef } from 'react';
import { games } from '@/data/games';
import { tournaments } from '@/data/tournaments';

export default function TitanPage() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Map Next.js data to Titan prototype data
    (window as any).__TITAN_DATA = {
        slides: tournaments.slice(0, 3).map(t => ({
            title: t.gameName,
            desc: t.title + ' — ' + t.description,
            reviews: '+' + Math.floor(Math.random() * 100) + ' نظرات',
            watch: t.participants,
            eta: 2*3600 + 14*60 + 33, // static for now
            plats: ['steam', 'epic'],
            faces: [11, 12, 13]
        })),
        games: games.map(g => ({
            t: g.title,
            d: g.description,
            p: 'مشاهده',
            theme: ['noir', 'flame', 'mist', 'neon', 'ice', 'ember'][Math.floor(Math.random() * 6)],
            fig: 'game',
            crest: Math.random() > 0.5
        })),
        picks: games.slice(0, 3).map(g => ({
            t: g.title,
            s: g.genre
        }))
    };

    // --- Titan Prototype Logic ---
    ${dynamicJsContent}
    // --- End Logic ---

  }, []);

  return (
    <div 
        suppressHydrationWarning 
        dangerouslySetInnerHTML={{ __html: \`${rawHtml}\` }} 
    />
  );
}
`;

fs.writeFileSync('src/app/page.tsx', pageTsx);
console.log("page.tsx generated");
