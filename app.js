import { data } from './data.js';
import { example, validState, itemDetails, calculate, routeMix, money } from './model.js';
const $ = id => document.getElementById(id);
const servicePhotos = {
  white: {src:'assets/item-02.jpg',label:'White socket installation'},
  metal: {src:'assets/item-03.jpg',label:'Metal-finish socket installation'},
  lights: {src:'assets/item-04.jpg',label:'Lighting and ventilation'},
  showers: {src:'assets/item-05.jpg',label:'Electric shower installation'},
  cookers: {src:'assets/item-22.jpg',label:'Electric cooker connection'},
  cable: {src:'assets/cable-supply.jpg',label:'Electrical cable supply'},
  cctv: {src:'assets/cctv.jpg',label:'CCTV installation'},
};
const categories = [ ['sockets','Sockets'], ['boards','Fuseboards'], ['lights','Lighting & fans'], ['showers','Showers'], ['cookers','Cookers'], ['cable','Cable supply'], ['cctv','CCTV'] ];
let state = example();
let service = 'sockets', selected = '2', mode = 'replace', boardSize = 12;
let isExample = true;
function element(tag, text, className) { const el = document.createElement(tag); if(text !== undefined) el.textContent=text; if(className) el.className=className; return el; }
function option(value,text) { const el=element('option',text); el.value=value; return el; }
function notice(text) { $('feedback').textContent=text; }
function readLink() {
  if (!location.hash.startsWith('#project=')) {
    const legacy = location.hash.slice(1).split('/');
    if (legacy[0] === 'fuseboards' && Number(legacy[1]) >= 4 && Number(legacy[1]) <= 15) {
      boardSize = Number(legacy[1]); service = 'boards';
      state = {...example(), cart: [{type:'board', ways:boardSize, qty:1}], routes:[], location:0};
      isExample = false;
    } else if (legacy[0] === 'cable-supply') service = 'cable';
    else if (legacy[0] === 'cctv') service = 'cctv';
    return;
  }
  try {
    const parsed=JSON.parse(decodeURIComponent(location.hash.slice(9)));
    if(!validState(parsed)) throw new Error('Invalid project');
    state=parsed;isExample=false;
    const board = state.cart.find(item => item.type === 'board');
    if(board) { service='boards'; boardSize=board.ways; }
  } catch { notice('This project link could not be read. The example project is shown.'); }
}
readLink();
for(const [id,name] of categories) {
  const button=element('button',name);button.type='button';button.dataset.service=id;
  button.addEventListener('click',()=>{service=id;selected=id==='showers'?'5':id==='lights'?'4':id==='cookers'?'21':'2';renderSelection();});
  $('services').append(button);
}
for(const [i,t] of data.travel.entries()) $('location').append(option(i,t.name));
for(const area of data.areas) $('area').append(option(area,area));
for(let n=4;n<=15;n++) {
  const button=element('button',`${n}-way`);button.type='button';button.dataset.ways=n;
  button.addEventListener('click',()=>{boardSize=n;renderSelection();});$('board-sizes').append(button);
}
function fittingList() {
  return data.fixed.filter(f=>service==='sockets'?['2','3'].includes(f.id):service==='showers'?Number(f.id)>=5&&Number(f.id)<=13:service==='cookers'?['21','22'].includes(f.id):service==='lights'?(f.id==='4'||Number(f.id)>=14&&Number(f.id)<=20||Number(f.id)>=23):false);
}
function renderSelection() {
  const board=service==='boards', quoteOnly=['cable','cctv'].includes(service);
  $('service-photo').hidden=board;
  const photo=servicePhotos[service==='sockets'?(selected==='2'?'white':'metal'):service];
  if(photo) {
    $('service-photo-image').src=photo.src;
    $('service-photo-image').alt=photo.label;
  }
  for(const button of $('services').children)button.setAttribute('aria-pressed',String(button.dataset.service===service));
  $('socket-mode').hidden=service!=='sockets';$('product-grid').hidden=board||quoteOnly;
  $('board-config').hidden=!board;$('fitting-config').hidden=board||quoteOnly;$('add-item').hidden=quoteOnly;$('selection-price').hidden=quoteOnly;$('quote-only').hidden=!quoteOnly;
  $('service-kicker').textContent=categories.find(c=>c[0]===service)[1].toUpperCase();
  $('select-title').textContent=board?'Choose your fuseboard':quoteOnly?'Tell us what you need':'Choose your fittings';
  document.querySelector('.section-heading .pill').hidden=quoteOnly;
  for(const b of $('socket-mode').children)b.setAttribute('aria-pressed',String(b.dataset.mode===mode));
  if(quoteOnly) {
    $('quote-service').textContent=service==='cable'?'Cable supply':'CCTV installation';
    $('quote-service-copy').textContent=service==='cable'?'Tell us the cable type, size and length you need. Call for a supply quote.':'Tell us the areas you want covered and whether you already have a system. Call for a tailored quote.';
    return;
  }
  if(board) {
    for(const b of $('board-sizes').children)b.setAttribute('aria-pressed',String(Number(b.dataset.ways)===boardSize));
    $('prev-board').disabled=boardSize===4;$('next-board').disabled=boardSize===15;
    $('board-poster').src=`assets/${boardSize}-way.jpg`;$('poster-link').href=`assets/${boardSize}-way.jpg`;
    $('board-poster').alt=`Juswrk ${boardSize}-way fuseboard replacement advert`;$('board-name').textContent=`${boardSize} protected circuits`;
  } else {
    $('product-grid').replaceChildren();
    for(const f of fittingList()) {
      const button=element('button',undefined,'product');button.type='button';button.setAttribute('aria-pressed',String(f.id===selected));
      const image=element('img',undefined,'product-photo');image.src=`assets/item-${f.id.padStart(2,'0')}.jpg`;image.alt='';image.loading='lazy';image.width=512;image.height=512;
      button.append(image,element('span',f.id==='2'?'Standard white socket':f.id==='3'?'Metal-finish socket':f.name),element('span',money(f[$('supply').value]),'product-price'));
      button.addEventListener('click',()=>{selected=f.id;renderSelection();});$('product-grid').append(button);
    }
  }
  const item=board?{type:'board',ways:boardSize,qty:1}:{type:'fitting',id:selected,supply:$('supply').value,qty:Number($('quantity').value)||1,mode};
  const detail=itemDetails(item);$('selection-price').replaceChildren(element('span',board?'Package price':`${item.qty} ${item.qty===1?'fitting':'fittings'} · ${money(detail.rate)} each`),element('strong',money(detail.total)));
}
function renderRoutes() {
  $('routes').replaceChildren();
  state.routes.forEach((route,index)=>{
    const row=element('div',undefined,'route-row'), fields=element('div',undefined,'route-fields');
    const methodLabel=element('label','Installation method'),select=element('select');select.setAttribute('aria-label',`Route ${index+1} method`);
    for(const r of data.routes)select.append(option(r.id,r.name));select.value=route.id;
    select.addEventListener('change',()=>{route.id=select.value;renderEstimate();renderRoutes();});methodLabel.append(select);
    const lengthLabel=element('label','Length (m)'),length=element('input');length.type='number';length.min='0';length.max='10000';length.step='0.5';length.value=route.metres;length.setAttribute('aria-label',`Route ${index+1} length`);
    length.addEventListener('input',()=>{route.metres=bounded(length,0,10000);renderEstimate();});lengthLabel.append(length);
    const countLabel=element('label','Cables'),count=element('input');count.type='number';count.min='1';count.max='100';count.value=route.cables;count.setAttribute('aria-label',`Route ${index+1} cable count`);
    count.addEventListener('input',()=>{route.cables=bounded(count,1,100,true);renderEstimate();});countLabel.append(count);
    fields.append(methodLabel,lengthLabel,countLabel);
    const bottom=element('div',undefined,'route-bottom'),rate=data.routes.find(r=>r.id===route.id).rate;
    bottom.append(element('span','Included in the combined installation price'));
    const remove=element('button','Remove section','remove');remove.type='button';remove.addEventListener('click',()=>{state.routes.splice(index,1);renderRoutes();renderEstimate();});bottom.append(remove);row.append(fields,bottom);$('routes').append(row);
  });
}
function bounded(input,min,max,integer=false) { const value=Number(input.value);return Math.min(max,Math.max(min,Number.isFinite(value)?integer?Math.round(value):value:min)); }
function costLine(parent,label,cost) { const row=element('div',undefined,'cost-line');row.append(element('span',label),element('strong',money(cost)));parent.append(row); }
function renderEstimate() {
  const result=calculate(state);isExample=isExample&&state.cart.length>0;
  $('example-note').hidden=!isExample;$('cart').replaceChildren();
  state.cart.forEach((item,index)=>{
    const detail=itemDetails(item),row=element('div',undefined,'cart-item'),top=element('div',undefined,'cart-item-top');
    top.append(element('span',`${item.qty} × ${detail.name}`),element('strong',money(detail.total)));row.append(top,element('p',detail.basis));
    const remove=element('button','Remove','remove');remove.type='button';remove.setAttribute('aria-label',`Remove ${detail.name}`);remove.addEventListener('click',()=>{state.cart.splice(index,1);isExample=false;renderEstimate();});row.append(remove);$('cart').append(row);
  });
  $('breakdown').replaceChildren();costLine($('breakdown'),'Shared route installation',result.routing);
  if(state.materials==='extra')costLine($('breakdown'),'Cable materials allowance',result.cable);
  costLine($('breakdown'),'Travel',result.travel);
  if(state.extras)costLine($('breakdown'),'Other agreed work',state.extras);
  if(state.testing)costLine($('breakdown'),'Additional testing',state.testing);
  if(state.vat)costLine($('breakdown'),`VAT · ${state.vat}%`,result.vat);
  $('grand-total').textContent=money(result.total);$('route-total').textContent=`${result.metres} m route · ${result.cableMetres} m cable`;
  $('empty-note').textContent=!result.active?'Add fittings or route sections to build your estimate.':'';
  $('view-quote').disabled=!result.active;$('share').disabled=!result.active;
  $('rate-label').hidden=state.materials!=='extra';
}
function syncInputs() {
  $('location').value=state.location;$('area').value=state.area;$('material-mode').value=state.materials;
  for(const [id,key] of [['cable-rate','cableRate'],['allowance','allowance'],['extras','extras'],['testing','testing'],['vat','vat']])$(id).value=state[key];
}
$('socket-mode').addEventListener('click',event=>{const button=event.target.closest('[data-mode]');if(button){mode=button.dataset.mode;renderSelection();}});
$('supply').addEventListener('change',renderSelection);$('quantity').addEventListener('change',()=>{$('quantity').value=bounded($('quantity'),1,100,true);renderSelection();});
for(const [id,step] of [['less',-1],['more',1]])$(id).addEventListener('click',()=>{$('quantity').value=Math.min(100,Math.max(1,Number($('quantity').value)+step));renderSelection();});
$('prev-board').addEventListener('click',()=>{boardSize=Math.max(4,boardSize-1);renderSelection();});$('next-board').addEventListener('click',()=>{boardSize=Math.min(15,boardSize+1);renderSelection();});
$('add-item').addEventListener('click',()=>{
  const item=service==='boards'?{type:'board',ways:boardSize,qty:1}:{type:'fitting',id:selected,supply:$('supply').value,qty:bounded($('quantity'),1,100,true),mode};
  if(state.cart.length>=50){notice('Your project has reached 50 item lines.');return;}
  state.cart.push(item);isExample=false;renderEstimate();notice('Added to your project.');
});
$('add-route').addEventListener('click',()=>{if(state.routes.length>=30){notice('Your project has reached 30 route sections.');return;}state.routes.push({id:'3',metres:0,cables:1});isExample=false;renderRoutes();renderEstimate();});
$('location').addEventListener('change',()=>{state.location=Number($('location').value);renderEstimate();});$('area').addEventListener('change',()=>{state.area=$('area').value;});
$('material-mode').addEventListener('change',()=>{state.materials=$('material-mode').value;renderEstimate();});
for(const [id,key,max] of [['cable-rate','cableRate',100000],['allowance','allowance',100000],['extras','extras',100000],['testing','testing',100000],['vat','vat',100]])$(id).addEventListener('input',()=>{state[key]=bounded($(id),0,max);renderEstimate();});
$('reset').addEventListener('click',()=>{state={...example(),cart:[],routes:[],location:0,materials:'included',cableRate:0,allowance:0,extras:0,testing:0,vat:0};isExample=false;history.replaceState(null,'',location.pathname+location.search);syncInputs();renderRoutes();renderEstimate();notice('Ready for a new project.');});
$('share').addEventListener('click',async()=>{
  const url=new URL(location.href);url.hash='project='+encodeURIComponent(JSON.stringify(state));
  try { await navigator.clipboard.writeText(url.href);history.replaceState(null,'',url.href);notice('Project link copied. You can paste it into Facebook or a message.'); }
  catch { const input=element('input');input.value=url.href;input.readOnly=true;input.setAttribute('aria-label','Project link to copy');$('feedback').replaceChildren(element('span','Copy this project link'),input);input.focus();input.select(); }
});
function quoteLine(name,basis,price) { const row=element('div',undefined,'quote-item'),description=element('div',name);if(basis)description.append(element('small',basis));row.append(description,element('strong',money(price)));$('quote-content').append(row); }
$('view-quote').addEventListener('click',()=>{
  const result=calculate(state);$('quote-content').replaceChildren(element('p',`${data.travel[state.location].name} · ${state.area} · ${new Date().toLocaleDateString('en-GB')}`));
  state.cart.forEach(item=>{const d=itemDetails(item);quoteLine(`${item.qty} × ${d.name}`,d.basis,d.total);});
  const activeRoutes=routeMix(result.routeLines);
  if(activeRoutes.length) {
    const routing=element('section',undefined,'quote-routing');
    routing.append(element('h3','Included routing · estimated mix'));
    const descriptions={
      '2':'using existing cabling', '3':'clipped on the surface',
      '4':'in conduit or trunking', '5':'SWA cleated',
      '6':'chased into walls, including making good',
      '7':'through framed plasterboard', '8':'through dot-and-dab plasterboard',
      '9':'under floorboards', '10':'through soft ground with SWA',
      '11':'through the loft', '12':'through saw-cut ground, including backfill',
    };
    for(const route of activeRoutes)routing.append(element('p',`${route.percentage}% ${descriptions[route.id]||route.name}`));
    routing.append(element('small','Included in the project total. Route mix confirmed at survey.'));
    $('quote-content').append(routing);
  }
  if(result.cable)quoteLine('Cable materials allowance','',result.cable);
  if(result.travel)quoteLine('Travel','',result.travel);
  if(state.extras)quoteLine('Other agreed work','',state.extras);
  if(state.testing)quoteLine('Additional testing','',state.testing);
  if(result.vat)quoteLine('VAT',`${state.vat}%`,result.vat);
  const total=element('div',undefined,'grand-total');total.append(element('span','Estimated total'),element('strong',money(result.total)));$('quote-content').append(total);$('quotation').showModal();
});
$('close-quote').addEventListener('click',()=>$('quotation').close());$('print-quote').addEventListener('click',()=>window.print());
window.addEventListener('hashchange',()=>{readLink();renderSelection();syncInputs();renderRoutes();renderEstimate();});
renderSelection();syncInputs();renderRoutes();renderEstimate();
