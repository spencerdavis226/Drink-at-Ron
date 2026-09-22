import { chromium, webkit } from '@playwright/test';
import { cards } from '../../../src/content/catalog';
import { writeFile } from 'node:fs/promises';
const dir='docs/studies/front-typography-2026-09-22';
const findings:unknown[]=[];
for(const [engine, launcher] of Object.entries({chromium,webkit})){
 const browser=await launcher.launch();
 const page=await browser.newPage({viewport:{width:1100,height:1100}});
 await page.goto(`http://127.0.0.1:4500/${dir}/?normal=1`);
 await page.evaluate(()=>document.fonts.ready);
 for(const width of [260,330,480]){
  await page.locator('.controls select').nth(1).selectOption(String(width));
  for(const large of [false,true]){
   await page.getByLabel('150% text').setChecked(large);
   for(const c of cards){
    await page.locator('.controls select').nth(0).selectOption(c.id);
    const m=await page.locator('[data-frame=c3]').evaluate(el=>{const t=el.querySelector('.study-title')!, h=t.querySelector('h2')!,r=el.querySelector('.study-rules')!;const hb=h.getBoundingClientRect(),tb=t.getBoundingClientRect();return{titleOverflow:hb.height>tb.height+1||h.scrollWidth>t.clientWidth+1,rulesOverflow:r.scrollHeight>r.clientHeight+2,lines:Math.round(hb.height/parseFloat(getComputedStyle(h).lineHeight))}});
    if(m.titleOverflow||m.rulesOverflow||m.lines>2)findings.push({engine,width,large,id:c.id,...m});
   }
  }
 }
 await page.locator('.controls select').nth(1).selectOption('330');
 await page.locator('.controls select').nth(0).selectOption('core.fuck-around');
 await page.getByLabel('150% text').check();
 await page.locator('.comparison').screenshot({path:`${dir}/c3-large-${engine}.png`});
 await page.locator('[data-frame=c3]').screenshot({path:`${dir}/c3-card-${engine}.png`});
 await browser.close();
}
await writeFile(`${dir}/measurements-c3.json`,JSON.stringify(findings,null,2));
console.log('Saved C3 typography measurements and screenshots.');
