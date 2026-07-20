import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
const sharp=createRequire(import.meta.url)('sharp');
await Promise.all(['public/special','docs/special','public/tiles','docs/tiles'].map(d=>mkdir(d,{recursive:true})));
const mask=Buffer.from('<svg width="426" height="630"><rect width="426" height="630" rx="34" fill="white"/></svg>');
const items=[
 ['public/previews/obstacles-variant-a.png','back',98,188,360,530],
 ['public/previews/obstacles-variant-c.png','ice',493,178,370,540],
 ['public/previews/obstacles-variant-b.png','wood',900,178,380,540],
 ['public/previews/obstacles-variant-b.png','stone',1315,178,380,540]
];
for(const [src,name,left,top,width,height] of items)for(const dir of ['public/special','docs/special'])await sharp(src).extract({left,top,width,height}).resize(426,630,{fit:'fill'}).composite([{input:mask,blend:'dest-in'}]).png({compressionLevel:9}).toFile(`${dir}/${name}.png`);
const honor='public/previews/honor-reference.jpg',xs=[326,456,585,714,843,972,1101];
for(let i=0;i<7;i++)for(const dir of ['public/tiles','docs/tiles'])await sharp(honor).extract({left:xs[i],top:738,width:112,height:166}).resize(426,630,{fit:'fill'}).composite([{input:mask,blend:'dest-in'}]).png({compressionLevel:9}).toFile(`${dir}/tile-real-${27+i}.png`);
