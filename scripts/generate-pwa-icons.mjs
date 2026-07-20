import {createRequire} from 'node:module';
import {mkdir,readFile} from 'node:fs/promises';
const sharp=createRequire(import.meta.url)('sharp');
const font=(await readFile(new URL('../public/mahjong-serif.woff2',import.meta.url))).toString('base64');
await mkdir('docs/icons',{recursive:true});
const svg=size=>Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512"><style>@font-face{font-family:Mahjong;src:url(data:font/woff2;base64,${font})}</style><defs><linearGradient id="g" x2="0" y2="1"><stop stop-color="#b8d7b0"/><stop offset="1" stop-color="#6fa775"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="14" stdDeviation="10" flood-color="#153e29" flood-opacity=".4"/></filter></defs><rect width="512" height="512" rx="104" fill="url(#g)"/><rect x="91" y="66" width="330" height="374" rx="55" fill="#17804b" filter="url(#s)"/><rect x="91" y="55" width="330" height="374" rx="55" fill="#fffdf2" stroke="#174d37" stroke-width="10"/><path d="M101 385h310v35q0 19-19 19H120q-19 0-19-19z" fill="#15925a"/><text x="256" y="300" text-anchor="middle" font-family="Mahjong,serif" font-size="210" font-weight="700" fill="#d93435">雀</text></svg>`);
for(const size of [180,192,512])await sharp(svg(size),{density:288}).resize(size,size).png({compressionLevel:9}).toFile(`docs/icons/icon-${size}.png`);
