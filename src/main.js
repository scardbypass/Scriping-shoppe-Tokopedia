const {app,BrowserWindow,ipcMain,dialog}=require('electron');
const {chromium}=require('playwright'); const path=require('path'),fs=require('fs'),cp=require('child_process');
const ExcelJS=require('exceljs'),Store=require('electron-store'); const store=new Store();
let ctx=null,stopping=false,fullRows=[],exportRows=[];
function win(){let w=new BrowserWindow({width:1450,height:900,minWidth:1050,minHeight:680,backgroundColor:'#07111f',autoHideMenuBar:true,icon:path.join(__dirname,'../assets/icon.png'),webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true}});w.loadFile(path.join(__dirname,'index.html'))}
app.whenReady().then(win); app.on('window-all-closed',()=>process.platform!=='darwin'&&app.quit());
const log=(e,msg,type='INFO')=>e.sender.send('log',{time:new Date().toLocaleTimeString('id-ID'),msg,type});
const sleep=n=>new Promise(r=>setTimeout(r,n));
function chrome(){for(const p of['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',process.env.LOCALAPPDATA+'/Google/Chrome/Application/chrome.exe'])if(fs.existsSync(p))return p;throw Error('Google Chrome tidak ditemukan.')}
const profile=m=>path.join(app.getPath('userData'),'chrome-profiles',m.toLowerCase());
const port=m=>m==='Shopee'?9331:9332;
ipcMain.handle('chrome:open',async(_,m)=>{fs.mkdirSync(profile(m),{recursive:true});let url=m==='Shopee'?'https://shopee.co.id/':'https://www.tokopedia.com/';cp.spawn(chrome(),[`--remote-debugging-port=${port(m)}`,`--user-data-dir=${profile(m)}`,url],{detached:true,stdio:'ignore'}).unref();return true});
ipcMain.handle('chrome:status',async(_,m)=>{try{let r=await fetch(`http://127.0.0.1:${port(m)}/json/version`);return{ready:r.ok}}catch{return{ready:false}}});
function merge(a,b){for(const[k,v]of Object.entries(b||{})){let empty=v==null||v===''||(Array.isArray(v)&&!v.length);if(!empty)a[k]=v}return a}
function money(v){if(v==null)return null;let n=Number(v);if(!Number.isFinite(n))return null;return n>=1000000?n/100000:n}
function img(u){
 if(!u||typeof u!=='string')return'';
 u=u.trim().replace(/&amp;/g,'&');
 if(!u||/\s/.test(u))return'';
 if(/^\/\//.test(u))u='https:'+u;
 if(/^https?:\/\//i.test(u))return u;
 // Shopee API can return an image key with transforms such as @resize_w900_nl.webp.
 // Keep the complete key instead of discarding the transform suffix.
 if(u.length>=12 && !u.includes('/'))return `https://down-id.img.susercontent.com/file/${u}`;
 return''
}
function simpleVariations(o){let tiers=Array.isArray(o?.tier_variations)?o.tier_variations:[];return tiers.map(t=>({name:t.name||'',options:(t.options||[]).map(x=>typeof x==='string'?x:(x?.option||x?.name||'')).filter(Boolean)})).filter(t=>t.name||t.options.length)}
function shopeeObj(o,map){if(!o||typeof o!=='object')return;if(Array.isArray(o)){o.forEach(x=>shopeeObj(x,map));return}
 let id=o.itemid??o.item_id;if(id){let sid=o.shopid??o.shop_id??'',ims=(o.images||[]).map(img).filter(Boolean),main=img(o.image||'');
 let x={item_id:String(id),shop_id:String(sid),name:o.name||o.item_name||'',price:money(o.price_min??o.price),discount_price:money(o.price_min_before_discount??o.price_before_discount),stock_status:o.stock===0?'HABIS':o.stock>0?'TERSEDIA':'UNKNOWN',rating:o.item_rating?.rating_star??o.rating_star??null,sold:o.historical_sold??o.sold??null,image_main:main,images:[...new Set([main,...ims].filter(Boolean))],url:sid?`https://shopee.co.id/product/${sid}/${id}`:'',category:o.catid??null,variations:simpleVariations(o),scraped_at:new Date().toISOString(),marketplace:'Shopee'};map.set(String(id),merge(map.get(String(id))||{},x))}
 Object.values(o).forEach(v=>v&&typeof v==='object'&&shopeeObj(v,map))}
function tokObj(o,map){if(!o||typeof o!=='object')return;if(Array.isArray(o)){o.forEach(x=>tokObj(x,map));return}let id=o.productID??o.productId;if(id&&(o.productName||o.name)){let x={item_id:String(id),shop_id:String(o.shopID??o.shopId??''),name:o.productName||o.name,price:Number(o.priceValue??o.price)||null,discount_price:null,stock_status:o.stock===0?'HABIS':'UNKNOWN',rating:o.ratingAverage??o.rating??null,sold:o.countSold??o.sold??null,image_main:o.imageURL??o.imageUrl??o.image??'',images:[],url:o.productURL??o.url??'',category:o.categoryName??null,variations:null,scraped_at:new Date().toISOString(),marketplace:'Tokopedia'};map.set(String(id),merge(map.get(String(id))||{},x))}Object.values(o).forEach(v=>v&&typeof v==='object'&&tokObj(v,map))}
function cleanProductImages(row){
 let main=img(row.image_main);
 let arr=[main,...(Array.isArray(row.images)?row.images:[])].map(img).filter(Boolean);
 const isProductImage=u=>{
  try{
   const x=new URL(u);
   if(/(?:^|\.)img\.susercontent\.com$/i.test(x.hostname)||/^(?:down-id|down-ws-sg)\.img\.susercontent\.com$/i.test(x.hostname))
     return x.pathname.startsWith('/file/') && x.pathname.length>('/file/'.length+8);
   return /tokopedia/i.test(x.hostname);
  }catch{return false}
 };
 let unique=[...new Set(arr)].filter(isProductImage);
 if(main&&isProductImage(main)&&!unique.includes(main))unique.unshift(main);
 row.images=unique.slice(0,12);
 row.image_main=(main&&isProductImage(main)?main:(unique[0]||''));
 if(Array.isArray(row.variations))row.variations=row.variations.map(v=>({name:v?.name||'',options:Array.isArray(v?.options)?v.options.map(x=>typeof x==='string'?x:(x?.option||x?.name||'')).filter(Boolean):[]})).filter(v=>v.name||v.options.length);
 return row
}
async function detail(page,row,market,map,emitLog){
 let url=row.url;if(!url&&market==='Shopee'&&row.shop_id&&row.item_id)url=`https://shopee.co.id/product/${row.shop_id}/${row.item_id}`;if(!url)return row;
 const target=String(row.item_id||'');
 // Clear stale target data so the detail-page response can enrich it, while keeping discovery data in row.
 let responseHit=false;
 const onResponse=async r=>{try{
   if(!(r.headers()['content-type']||'').includes('json'))return;
   const j=await r.json();
   const tmp=new Map(); market==='Shopee'?shopeeObj(j,tmp):tokObj(j,tmp);
   const hit=tmp.get(target);
   if(hit){ responseHit=true; map.set(target,merge(map.get(target)||{},hit)); }
 }catch{}};
 page.on('response',onResponse);
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
 // Shopee is an SPA; give its product-detail XHR and gallery time to render.
 for(let i=0;i<10&&!responseHit;i++)await sleep(250);
 await sleep(700);
 let meta=await page.evaluate(()=>{
   const content=s=>document.querySelector(s)?.content||'';
   const urls=[]; const push=u=>{if(typeof u==='string'&&u.trim())urls.push(u.trim())};
   push(content('meta[property="og:image"]')); push(content('meta[name="twitter:image"]'));
   // Product JSON-LD fallback.
   for(const el of document.querySelectorAll('script[type="application/ld+json"]')){try{
     const j=JSON.parse(el.textContent||'{}'); const walk=x=>{if(!x)return;if(Array.isArray(x))return x.forEach(walk);if(typeof x==='object'){if(String(x['@type']||'').toLowerCase()==='product'){const im=x.image; (Array.isArray(im)?im:[im]).forEach(push)} Object.values(x).forEach(v=>{if(v&&typeof v==='object')walk(v)})}}; walk(j)
   }catch{}}
   // DOM fallback: only large, visible Shopee CDN images. This avoids icons/avatars/assets.
   const candidates=[];
   for(const im of document.images){
     const u=im.currentSrc||im.src||''; if(!/img\.susercontent\.com\/file\//i.test(u))continue;
     const r=im.getBoundingClientRect(); const w=Math.max(im.naturalWidth||0,r.width||0),h=Math.max(im.naturalHeight||0,r.height||0);
     if(w>=180&&h>=180&&r.bottom>=0&&r.top<=innerHeight*2.2)candidates.push({u,w,h,area:w*h});
   }
   candidates.sort((a,b)=>b.area-a.area); candidates.slice(0,16).forEach(x=>push(x.u));
   // Some gallery slides use CSS background-image.
   for(const el of document.querySelectorAll('[style*="background-image"]')){const r=el.getBoundingClientRect();if(r.width<180||r.height<180)continue;const m=(el.getAttribute('style')||'').match(/url\(["']?([^"')]+)["']?\)/i);if(m)push(m[1])}
   return {title:content('meta[property="og:title"]')||document.title,image:content('meta[property="og:image"]'),url:content('meta[property="og:url"]')||location.href,images:[...new Set(urls)]};
 }).catch(()=>({images:[]}));
 page.off('response',onResponse);
 const fresh=map.get(target); if(fresh)merge(row,fresh);
 let source='NONE';
 if(row.image_main||(row.images||[]).length)source=responseHit?'DETAIL API':'DISCOVERY/API';
 if(meta.title&&!row.name)row.name=meta.title.replace(/\s*[|\-]\s*Shopee.*$/i,'').trim();
 const domImages=(meta.images||[]).map(img).filter(Boolean);
 if(domImages.length){ if(!row.image_main)row.image_main=domImages[0]; row.images=[...(row.images||[]),...domImages]; if(source==='NONE')source='PAGE GALLERY/OG'; }
 if(meta.url)row.url=meta.url;
 row=cleanProductImages(row);
 if(emitLog)emitLog(`DETAIL ${responseHit?'FOUND':'FALLBACK'} • IMAGE SOURCE: ${source} • ${row.images.length} foto`,row.image_main?'SUCCESS':'WARN');
 return row
}
async function discoverTokopedia(page, shopUrl, map, limit){
 // Tokopedia store pages render product cards dynamically. Discovery is DOM-first so it
 // does not depend on private GraphQL response shapes. Shopee code is intentionally untouched.
 const shopSlug=(()=>{try{return new URL(shopUrl).pathname.split('/').filter(Boolean)[0]?.toLowerCase()||''}catch{return''}})();
 for(let round=0;round<22&&map.size<limit;round++){
  const found=await page.evaluate(({shopSlug})=>{
   const out=[]; const seen=new Set();
   const bad=new Set(['','p','product','products','etalase','review','reviews','info','about','feed','reputation','talk','chat']);
   const clean=u=>{try{const x=new URL(u,location.href);x.hash='';return x.href}catch{return''}};
   const add=(a)=>{
    const u=clean(a.href||''); if(!u||seen.has(u))return;
    let x;try{x=new URL(u)}catch{return}
    if(!/(^|\.)tokopedia\.com$/i.test(x.hostname))return;
    const seg=x.pathname.split('/').filter(Boolean);
    // Product URLs on Tokopedia are normally /<shop>/<product-slug>.
    if(seg.length<2||seg[0].toLowerCase()!==shopSlug||bad.has((seg[1]||'').toLowerCase()))return;
    if(/\/shop\//i.test(x.pathname)||/\/help|\/discovery|\/search/i.test(x.pathname))return;
    const card=a.closest('[data-testid*="Product"],article,div[class*="css-"]')||a;
    const im=card.querySelector?.('img')||a.querySelector?.('img');
    const text=(card.innerText||a.innerText||'').trim();
    const name=(im?.alt||text.split('\n').find(t=>t&& !/^Rp\s?/i.test(t))||'').trim();
    const priceText=text.split('\n').find(t=>/^Rp\s?[\d.]+/i.test(t))||'';
    seen.add(u);out.push({url:u,name,image:im?.currentSrc||im?.src||'',priceText});
   };
   document.querySelectorAll('a[data-testid="lnkProductContainer"],a[href]').forEach(add);
   // JSON-LD ItemList/Product is a useful fallback when cards are virtualized.
   document.querySelectorAll('script[type="application/ld+json"]').forEach(el=>{try{
    const j=JSON.parse(el.textContent||'null');const walk=v=>{if(!v)return;if(Array.isArray(v))return v.forEach(walk);if(typeof v==='object'){
      if(String(v['@type']||'').toLowerCase()==='product' && v.url){out.push({url:clean(v.url),name:v.name||'',image:Array.isArray(v.image)?v.image[0]:(v.image||''),priceText:v.offers?.price?String(v.offers.price):''})}
      Object.values(v).forEach(x=>x&&typeof x==='object'&&walk(x));
    }};walk(j)
   }catch{}});
   return out;
  },{shopSlug}).catch(()=>[]);
  for(const x of found){
   let u=x.url; if(!u)continue; let key='';try{const z=new URL(u);key=z.pathname.replace(/^\/+|\/+$/g,'').toLowerCase()}catch{continue}
   if(!key||map.has(key))continue;
   let price=null;if(x.priceText){const d=String(x.priceText).replace(/[^\d]/g,'');if(d)price=Number(d)}
   map.set(key,{item_id:key,shop_id:shopSlug,name:x.name||'',price,discount_price:null,stock_status:'UNKNOWN',rating:null,sold:null,image_main:x.image||'',images:x.image?[x.image]:[],url:u,category:null,variations:[],scraped_at:new Date().toISOString(),marketplace:'Tokopedia'});
   if(map.size>=limit)break;
  }
  if(map.size>=limit)break;
  await page.evaluate(()=>window.scrollBy(0,Math.max(900,innerHeight*.85))).catch(()=>{});await sleep(650);
 }
 return [...map.values()].slice(0,limit)
}
async function detailTokopedia(page,row,emitLog){
 await page.goto(row.url,{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});await sleep(1800);
 const d=await page.evaluate(()=>{
  const meta=s=>document.querySelector(s)?.content||''; const imgs=[]; const push=u=>{if(typeof u==='string'&&/^https?:/i.test(u)&&!imgs.includes(u))imgs.push(u)};
  push(meta('meta[property="og:image"]'));push(meta('meta[name="twitter:image"]'));
  let ld=null;document.querySelectorAll('script[type="application/ld+json"]').forEach(el=>{try{const j=JSON.parse(el.textContent||'null');const walk=v=>{if(!v||ld)return;if(Array.isArray(v))return v.forEach(walk);if(typeof v==='object'){if(String(v['@type']||'').toLowerCase()==='product'){ld=v;return}Object.values(v).forEach(walk)}};walk(j)}catch{}});
  if(ld){(Array.isArray(ld.image)?ld.image:[ld.image]).forEach(push)}
  // Only large visible Tokopedia product media; exclude tiny icons/avatars.
  document.querySelectorAll('img').forEach(im=>{const u=im.currentSrc||im.src||'';if(!/tokopedia|tkpd/i.test(u))return;const r=im.getBoundingClientRect();const w=Math.max(im.naturalWidth||0,r.width),h=Math.max(im.naturalHeight||0,r.height);if(w>=220&&h>=220&&r.top<innerHeight*2.5)push(u)});
  const body=document.body.innerText||'';
  const priceText=ld?.offers?.price||meta('meta[property="product:price:amount"]')||((body.match(/Rp\s?[\d.]+/)||[])[0]||'');
  return {name:ld?.name||meta('meta[property="og:title"]')||document.title,url:ld?.url||meta('meta[property="og:url"]')||location.href,images:imgs,priceText,rating:ld?.aggregateRating?.ratingValue??null,sold:null,availability:ld?.offers?.availability||''};
 }).catch(()=>({images:[]}));
 if(d.name&&!row.name)row.name=String(d.name).replace(/\s*[|\-]\s*Tokopedia.*$/i,'').trim();
 if(d.url)row.url=d.url;
 if(d.priceText&&!row.price){const n=Number(String(d.priceText).replace(/[^\d]/g,''));if(n)row.price=n}
 if(d.rating!=null)row.rating=Number(d.rating)||d.rating;
 if(/outofstock/i.test(d.availability))row.stock_status='HABIS';else if(/instock/i.test(d.availability))row.stock_status='TERSEDIA';
 // Tokopedia: prioritize real product CDN images. Store cards can expose 1f-web-assets
 // placeholders; those must never become image_main when a signed p16/p19 product image exists.
 const raw=(d.images||[]).filter(Boolean);
 const isTokProductImage=u=>{try{const h=new URL(u).hostname.toLowerCase();return /(^|\.)p\d+-images(?:-sign)?-[^.]+\.tokopedia-static\.net$/.test(h)||/images(?:-sign)?[^.]*\.tokopedia-static\.net$/.test(h)}catch{return false}};
 const isTokAsset=u=>{try{return /(^|\.)(?:1f-web-assets|assets)[^.]*\.tokopedia-static\.net$/i.test(new URL(u).hostname)}catch{return true}};
 const productImages=[...new Set(raw.filter(isTokProductImage))];
 const otherImages=[...new Set(raw.filter(u=>!isTokAsset(u)&&/tokopedia-static\.net/i.test(u)))];
 const preferred=[...productImages,...otherImages];
 if(preferred.length){row.image_main=preferred[0];row.images=preferred.slice(0,12)}
 else if(raw.length && !isTokAsset(raw[0])){row.image_main=raw[0];row.images=[...new Set(raw)].slice(0,12)}
 else {row.image_main='';row.images=[]}
 if(emitLog)emitLog(`TOKOPEDIA DETAIL • ${row.images.length} foto • MAIN: ${row.image_main?'PRODUCT CDN':'NONE'}${row.rating!=null?' • rating '+row.rating:''}`,row.image_main?'SUCCESS':'WARN');
 return row
}

function pick(row,fields){let x={};for(const f of fields)if(f in row)x[f]=row[f];return x}
ipcMain.on('scrape:stop',()=>{stopping=true});
ipcMain.handle('scrape:start',async(e,o)=>{stopping=false;fullRows=[];exportRows=[];let market=o.market,limit=Math.max(1,Math.min(500,+o.limit||10)),fields=o.fields||[];if(!o.url)throw Error('Link toko belum diisi.');if(!fields.length)throw Error('Pilih minimal satu field.');
 let map=new Map();log(e,'SCARD Engine v18 starting...');log(e,`Platform: ${market}`);
 try{ctx=await chromium.connectOverCDP(`http://127.0.0.1:${port(market)}`)}catch{throw Error(`Chrome ${market} belum siap. Klik Buka Chrome terlebih dahulu.`)}
 log(e,'Chrome berhasil terhubung ✓','SUCCESS');let pages=ctx.contexts()[0]?.pages()||[];let page=pages[0]||await ctx.contexts()[0].newPage();
 page.on('response',async r=>{try{if(!(r.headers()['content-type']||'').includes('json'))return;let j=await r.json();market==='Shopee'?shopeeObj(j,map):tokObj(j,map)}catch{}});
 log(e,'Membuka toko...');await page.goto(o.url,{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});await sleep(1800);
 let rows=[];
 if(market==='Tokopedia'){
  log(e,'Tokopedia: membaca kartu produk dari halaman toko...');
  // Network map can contain unrelated recommendation objects, so reset and use store DOM discovery.
  map.clear(); rows=await discoverTokopedia(page,o.url,map,limit);
 }else{
  for(let z=0;z<18&&map.size<limit&&!stopping;z++){let links=await page.evaluate(()=>[...document.querySelectorAll('a[href]')].map(a=>({u:a.href,t:(a.innerText||'').trim(),i:a.querySelector('img')?.src||''}))).catch(()=>[]);
   for(const x of links){if(market==='Shopee'){let m=x.u.match(/\/product\/(\d+)\/(\d+)/)||x.u.match(/-i\.(\d+)\.(\d+)/);if(m){let id=String(m[2]);map.set(id,merge(map.get(id)||{item_id:id,marketplace:'Shopee'}, {shop_id:String(m[1]),name:x.t.split('\n')[0],url:x.u,image_main:x.i}))}}}
   e.sender.send('progress',{found:Math.min(map.size,limit),done:0,total:limit});await page.evaluate(()=>scrollBy(0,1500)).catch(()=>{});await sleep(500)}
  rows=[...map.values()].slice(0,limit);
 }
 if(!rows.length)throw Error('Produk tidak ditemukan dari halaman toko.');log(e,`${rows.length} produk ditemukan`,'SUCCESS');
 let ok=0,partial=0,fail=0;
 for(let i=0;i<rows.length&&!stopping;i++){let r=rows[i];e.sender.send('product',{index:i+1,total:rows.length,status:'PROCESSING',row:r});log(e,`[${i+1}/${rows.length}] Membaca detail produk...`,'PROCESS');
  try{r=market==='Tokopedia'?await detailTokopedia(page,r,(m,t)=>log(e,m,t)):await detail(page,r,market,map,(m,t)=>log(e,m,t));r=cleanProductImages(r);let core=[r.name,r.price,r.image_main,r.url,r.item_id].filter(v=>v!==null&&v!=='').length;let st=core>=4?'SUCCESS':'PARTIAL';st==='SUCCESS'?ok++:partial++;fullRows.push(r);exportRows.push(pick(r,fields));e.sender.send('product',{index:i+1,total:rows.length,status:st,row:r});log(e,`[${i+1}/${rows.length}] ${r.name||'Produk'} • ${r.price?('Rp '+Number(r.price).toLocaleString('id-ID')):'harga ?'} • ${r.images.length} foto`,st)}
  catch(err){fail++;e.sender.send('product',{index:i+1,total:rows.length,status:'FAILED',row:r});log(e,`[${i+1}/${rows.length}] Gagal membaca produk`,'ERROR')}
  e.sender.send('progress',{found:rows.length,done:i+1,total:rows.length});e.sender.send('summary',{total:rows.length,ok,partial,fail})}
 if(stopping)log(e,'Proses dihentikan.','WARN');else log(e,`SELESAI • ${ok} sukses • ${partial} partial • ${fail} gagal`,'SUCCESS');return{ok,partial,fail,total:rows.length}});
ipcMain.handle('settings:get',()=>store.get('server',{endpoint:'',token:'',autoUpload:false}));
ipcMain.handle('settings:set',(_,s)=>{store.set('server',s);return true});
async function upload(){let s=store.get('server',{});if(!s.endpoint)throw Error('Endpoint cPanel belum diisi.');let r=await fetch(s.endpoint,{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+s.token},body:JSON.stringify({source:'SCARD-PROJECT',products:fullRows})});if(!r.ok)throw Error('HTTP '+r.status);return r.text()}
ipcMain.handle('upload:now',()=>upload());
ipcMain.handle('api:test',async(_,s)=>{let r=await fetch(s.endpoint,{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+s.token},body:'{"ping":true,"products":[]}'});if(!r.ok)throw Error('HTTP '+r.status);return true});
ipcMain.handle('export:json',async()=>{if(!exportRows.length)throw Error('Belum ada hasil.');let r=await dialog.showSaveDialog({defaultPath:'produk-toko.json',filters:[{name:'JSON',extensions:['json']}]});if(!r.canceled)fs.writeFileSync(r.filePath,JSON.stringify(exportRows,null,2))});
ipcMain.handle('export:xlsx',async()=>{if(!exportRows.length)throw Error('Belum ada hasil.');let r=await dialog.showSaveDialog({defaultPath:'produk-toko.xlsx',filters:[{name:'Excel',extensions:['xlsx']}]});if(r.canceled)return;let wb=new ExcelJS.Workbook(),ws=wb.addWorksheet('Produk'),keys=[...new Set(exportRows.flatMap(Object.keys))];ws.columns=keys.map(k=>({header:k,key:k,width:24}));exportRows.forEach(x=>{let z={};keys.forEach(k=>z[k]=typeof x[k]==='object'?JSON.stringify(x[k]):x[k]);ws.addRow(z)});await wb.xlsx.writeFile(r.filePath)});
