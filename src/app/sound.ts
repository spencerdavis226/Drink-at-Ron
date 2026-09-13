import type {Effect} from '../presentation/controller';
/** Original synthesized foley. No network, media playback, or dependency on audio availability. */
export class TavernAudio {
 private context:AudioContext|undefined;
 private effects=false;private ambience=false;private unlocked=false;private hidden=false;
 private bed:AudioBufferSourceNode|undefined;private bedGain:GainNode|undefined;private crackle:ReturnType<typeof setInterval>|undefined;
 configure(effects:boolean,ambience:boolean){this.effects=effects;this.ambience=ambience;this.sync()}
 unlock(){this.unlocked=true;this.sync()}
 setHidden(hidden:boolean){this.hidden=hidden;this.sync()}
 private getContext(){try{this.context??=new AudioContext();return this.context}catch{return undefined}}
 private noise(ctx:AudioContext,duration:number,volume:number,frequency:number,loop=false){
  const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate);const data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
  const source=ctx.createBufferSource();source.buffer=buffer;source.loop=loop;
  const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=frequency;
  const gain=ctx.createGain();gain.gain.setValueAtTime(volume,ctx.currentTime);
  if(!loop)gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);
  source.connect(filter).connect(gain).connect(ctx.destination);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect()};source.start();if(!loop)source.stop(ctx.currentTime+duration);return {source,gain};
 }
 private tap(ctx:AudioContext,frequency:number,duration:number,volume:number){
  const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='triangle';osc.frequency.setValueAtTime(frequency,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(frequency*.55,ctx.currentTime+duration);gain.gain.setValueAtTime(volume,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);osc.connect(gain).connect(ctx.destination);osc.onended=()=>{osc.disconnect();gain.disconnect()};osc.start();osc.stop(ctx.currentTime+duration);
 }
 play(event:Effect){if(!this.unlocked||this.hidden||!this.effects)return;const ctx=this.getContext();if(!ctx||ctx.state!=='running')return;
  try{if(event==='deal'){this.noise(ctx,.38,.10,1700);this.tap(ctx,150,.14,.035)}else if(event==='reveal'){this.noise(ctx,.2,.07,2600);this.tap(ctx,660,.18,.006)}else if(event==='discard'){this.noise(ctx,.24,.065,1400);this.tap(ctx,130,.12,.04)}else if(event==='complete'){this.tap(ctx,660,.35,.018);this.tap(ctx,990,.5,.012)}else this.tap(ctx,160,.09,.025)}catch{/* foley never blocks an action */}
 }
 private stopBed(){if(this.crackle)clearInterval(this.crackle);this.crackle=undefined;try{this.bed?.stop()}catch{/* already ended */}this.bed=undefined;this.bedGain=undefined}
 private sync(){
  if(this.hidden||!this.unlocked||(!this.effects&&!this.ambience)){this.stopBed();void this.context?.suspend().catch(()=>{});return}
  const ctx=this.getContext();if(!ctx)return;
  void ctx.resume().then(()=>{if(this.hidden||!this.unlocked||!this.ambience||this.bed)return;
   try{const bed=this.noise(ctx,3,.035,170,true);this.bed=bed.source;this.bedGain=bed.gain;
    this.crackle=setInterval(()=>{if(this.hidden||!this.ambience)return;try{this.noise(ctx,.035+Math.random()*.09,.008+Math.random()*.018,1000+Math.random()*2000);if(Math.random()<.08)this.tap(ctx,90,.35,.007)}catch{/* quiet failure */}},700);
   }catch{/* ambience is optional */}
  }).catch(()=>{});
  if(!this.ambience)this.stopBed();
 }
 dispose(){this.unlocked=false;this.stopBed();void this.context?.close().catch(()=>{});this.context=undefined}
}
export const tavernAudio=new TavernAudio();
