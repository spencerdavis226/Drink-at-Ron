import sharp from 'sharp';
const sheet='assets/source/ui-chrome-final.png';
for(const [name,left,top,width,height] of [['button',40,47,1175,384],['panel',40,475,660,698],['bezel',756,587,452,454]] as const){await sharp(sheet).extract({left,top,width,height}).webp({quality:85}).toFile(`public/art/${name}.webp`);}
