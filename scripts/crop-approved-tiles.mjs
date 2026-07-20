import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
const sharp=createRequire(import.meta.url)('sharp');
const input='public/previews/mahjong-27-realistic-v2.png';
const xs=[49,210,371,532,693,854,1015,1176,1337],ys=[127,376,632];
for(const dir of ['public/tiles','docs/tiles'])await mkdir(dir,{recursive:true});
for(let row=0;row<3;row++)for(let col=0;col<9;col++){const n=row*9+col;for(const dir of ['public/tiles','docs/tiles'])await sharp(input).extract({left:xs[col],top:ys[row],width:142,height:210}).resize(426,630,{fit:'fill'}).png({compressionLevel:9}).toFile(`${dir}/tile-real-${n}.png`)}
