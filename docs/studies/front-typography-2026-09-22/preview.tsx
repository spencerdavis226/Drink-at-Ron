import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CardFace } from '../../../src/components/Cards';
import { cards } from '../../../src/content/catalog';
import '../../../src/presentation/theme.css';
import '../../../src/presentation/card-front.css';
import './study.css';

const params = new URLSearchParams(location.search);
function Study() {
  const [selected, setSelected] = useState(params.get('card') || 'core.fuck-around');
  const original = cards.find(c => c.id === selected) || cards[0];
  const [title, setTitle] = useState<string | null>(params.get('title'));
  const [rules, setRules] = useState<string | null>(params.get('rules'));
  const [width, setWidth] = useState(Number(params.get('width')) || 330);
  const [emboss, setEmboss] = useState(true);
  const [serif, setSerif] = useState(params.get('font') === 'source');
  const [large, setLarge] = useState(!params.has('normal'));
  const card = { ...original, title: title ?? original.title, rules: rules ?? original.rules };
  return <main>
    <header><h1>Real type. Real card.</h1><p>Live HTML text · actual CardFace component · plain parchment</p></header>
    <section className="controls">
      <label>Sample<select value={selected} onChange={e => {setSelected(e.target.value);setTitle(null);setRules(null);}}>{cards.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
      <label>Card width<select value={width} onChange={e => setWidth(Number(e.target.value))}><option value="260">Small phone · 260px</option><option value="330">Phone · 330px</option><option value="480">Tablet · 480px</option></select></label>
      <label><input type="checkbox" checked={large} onChange={e=>setLarge(e.target.checked)}/>150% text</label>
      <label><input type="checkbox" checked={serif} onChange={e=>setSerif(e.target.checked)}/>Source Serif rules</label>
      <label><input type="checkbox" checked={emboss} onChange={e=>setEmboss(e.target.checked)}/>Embossed title</label>
      <label>Title<input value={card.title} onChange={e=>setTitle(e.target.value)}/></label>
      <label>Rules<textarea value={card.rules} onChange={e=>setRules(e.target.value)}/></label>
    </section>
    <div className={`comparison ${large ? 'large-text' : ''} ${serif ? 'reading-serif' : ''} ${emboss ? 'embossed' : ''}`} style={{'--study-width':`${width}px`} as React.CSSProperties}>
      {['c3','c'].map(frame=><section className="sample" key={frame}><h2 className="sample-label">{frame==='c3'?'New · Ornate teal':'Previous · Recessed teal'}</h2><article data-frame={frame} className="preview-card"><CardFace card={card}/></article></section>)}
    </div>
    <p className="note">Design study only. Edits here never touch your saved game. Text stays selectable; scroll long rules inside the card.</p>
  </main>;
}
createRoot(document.getElementById('root')!).render(<Study/>);
