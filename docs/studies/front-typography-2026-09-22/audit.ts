import {chromium,webkit} from '@playwright/test';
import {cards} from '../../../src/content/catalog';
import {writeFile} from 'node:fs/promises';
const dir='docs/studies/front-typography-2026-09-22';
const url='http://127.0.0.1:4500/'+dir+'/';
const findings:any[]=[];
for(const [engine,launcher] of Object.entries({chromium,webkit})){
 const browser=await launcher.launch();const page=await browser.newPage({viewport:{width:1100,height:1000},deviceScaleFactor:1});
 page.on('pageerror', e=>console.log('ERROR',e.message));
 await page.goto(url);await page.evaluate(()=>document.fonts.ready);
 await page.locator('.card-imprint-lattice').first().waitFor();
 for(const width of [260,330,480]){
  await page.locator('.controls select').nth(1).selectOption(String(width));
  for(const c of cards){
   await page.locator('.controls select').nth(0).selectOption(c.id);
   const m=await page.locator('.preview-card').evaluateAll(els=>els.map(el=>{const t=el.querySelector('.study-title')!, h=t.querySelector('h2')!, r=el.querySelector('.study-rules')!, p=r.querySelector('p')!;return{frame:el.getAttribute('data-frame'),titleOverflow:h.getBoundingClientRect().height>t.clientHeight+1,rulesOverflow:r.scrollHeight>r.clientHeight+2,titleLines:Math.round(h.getBoundingClientRect().height/parseFloat(getComputedStyle(h).lineHeight)),ruleLines:Math.round(p.getBoundingClientRect().height/parseFloat(getComputedStyle(p).lineHeight))}}));
   for(const v of m)if(v.titleOverflow||v.rulesOverflow)findings.push({engine,width,id:c.id,...v});
  }
 }
 if(engine==='chromium'){
  for(const [name,id,title] of [['short','core.house-special',''],['long','vip.never-alone',''],['two-line','core.house-special','A Questionable Decision']]){
   await page.locator('.controls select').nth(1).selectOption('330');await page.locator('.controls select').nth(0).selectOption(id);if(title)await page.getByLabel('Title',{exact:true}).fill(title);
   await page.locator('.comparison').screenshot({path:`${dir}/${name}.png`});
  }
  await page.locator('.controls select').nth(1).selectOption('260');
  await page.getByLabel('150% text').check();
  await page.locator('.comparison').screenshot({path:`${dir}/enlarged-stress.png`});
 }
 await browser.close();
}
await writeFile(`${dir}/measurements.json`,JSON.stringify(findings,null,2));
console.log(`${findings.length} overflow records saved; 52 cards × 3 widths × 2 frames × 2 browsers inspected. See measurements.json.`);
