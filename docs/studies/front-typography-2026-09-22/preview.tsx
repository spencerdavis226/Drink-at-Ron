import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CardFace } from '../../../src/components/Cards';
import { cards } from '../../../src/content/catalog';
import '../../../src/presentation/theme.css';
import '../../../src/presentation/card-front.css';
import './study.css';

const stressTitles = [
  { id: 'short', label: 'House Special', title: 'House Special' },
  { id: 'wide', label: 'Wide letters', title: 'WAVY WIZARD WALTZ' },
  { id: 'unbroken', label: 'Long unbroken word', title: 'Supercalifragilisticexpialidocious' },
] as const;
const longest = [...cards].sort((a, b) => b.title.length - a.title.length).slice(0, 6);
const params = new URLSearchParams(location.search);

function Study() {
  const [selected, setSelected] = useState(params.get('card') || 'core.fuck-around');
  const [customTitle, setCustomTitle] = useState<string | null>(params.get('title'));
  const [width, setWidth] = useState(Number(params.get('width')) || 330);
  const [large, setLarge] = useState(params.has('large'));
  const stress = stressTitles.find(item => item.id === selected);
  const original = cards.find(card => card.id === selected) || cards[0];
  const card = { ...original, title: customTitle ?? stress?.title ?? original.title };

  return <main>
    <header>
      <h1>Production card title</h1>
      <p>Live CardFace · approved frame · Source Serif 4 Bold in ivory</p>
    </header>
    <section className="controls" aria-label="Preview controls">
      <label>Title sample
        <select value={selected} onChange={event => { setSelected(event.target.value); setCustomTitle(null); }}>
          <optgroup label="Stress samples">{stressTitles.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</optgroup>
          <optgroup label="Longest real titles">{longest.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</optgroup>
          <optgroup label="Full catalog">{cards.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</optgroup>
        </select>
      </label>
      <label>Card width
        <select value={width} onChange={event => setWidth(Number(event.target.value))}>
          <option value="260">Small phone · 260px</option>
          <option value="330">Phone · 330px</option>
          <option value="480">Tablet · 480px</option>
        </select>
      </label>
      <label className="check"><input type="checkbox" checked={large} onChange={event => setLarge(event.target.checked)}/>Enlarged title</label>
      <label>Try a title<input value={card.title} onChange={event => setCustomTitle(event.target.value)}/></label>
    </section>
    <div className={`comparison ${large ? 'enlarged' : ''}`} style={{ '--study-width': `${width}px` } as React.CSSProperties}>
      <article className="preview-card"><CardFace card={card}/></article>
    </div>
    <p className="note">Study controls do not touch saved games. Titles scale with card width and shrink only when the live text needs it; every authored title must pass the two-line fit check.</p>
  </main>;
}

createRoot(document.getElementById('root')!).render(<Study/>);
