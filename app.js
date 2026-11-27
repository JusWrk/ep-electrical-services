import {socketIds,isLightingItem,securityLightIds,addProjectSelection,removeProjectSelection} from './project-options.js?v=20261127-controls-v1';
import { lightingGroups, fanItems, lightingItemIds } from './lighting.js?v=20261127-controls-v1';
import { buildQuotePdf } from './quote-pdf.js';
import { data } from './data.js?v=20261127-controls-v1';
import { example, validState, itemDetails, calculate, routeMix, money } from './model.js?v=20261127-controls-v1';
const $ = id => document.getElementById(id);
const servicePhotos = {
  white: {src:'assets/item-02.jpg',label:'White socket installation'},
  metal: {src:'assets/item-03.jpg',label:'Metal-finish socket installation'},
  lights: {src:'assets/item-04-white-pendant.jpg',label:'Lighting and ventilation'},
  showers: {src:'assets/item-05.jpg',label:'Electric shower installation'},
  cookers: {src:'assets/item-22.jpg',label:'Electric cooker connection'},
  cable: {src:'assets/cable-supply.jpg',label:'Electrical cable supply'},
  cctv: {src:'assets/cctv.jpg',label:'CCTV installation'},
};
const categories = [ ['sockets','Sockets'], ['boards','Fuseboards'], ['lights','Lighting'], ['automation','Automation'], ['fans','Fans'], ['showers','Showers'], ['cookers','Cookers'], ['cable','Cable supply'], ['cctv','CCTV'] ];
let state = example();
let service = 'sockets', selected = '2', mode = 'replace', boardSize = 12;
let isExample = false;
let lightingGroup = 'ceiling';
let supplyPreference = 'supply';
function element(tag, text, className) { const el = document.createElement(tag); if(text !== undefined) el.textContent=text; if(className) el.className=className; return el; }
function option(value,text) { const el=element('option',text); el.value=value; return el; }
function notice(text) { $('feedback').textContent=text; }
function readLink() {
  if (!location.hash.startsWith('#project=')) {
    const legacy = location.hash.slice(1).split('/');
    if (legacy[0] === 'fuseboards' && Number(legacy[1]) >= 4 && Number(legacy[1]) <= 21) {
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
    else {
      const fitting=state.cart.find(item=>item.type==='fitting');
      if(fitting&&socketIds.includes(fitting.id)){service='sockets';selected=fitting.id;mode=fitting.mode;supplyPreference=fitting.supply;}
      else if(fitting&&fanItems.includes(fitting.id)){service='fans';selected=fitting.id;}
      else if(fitting&&fitting.id==='33'){service='automation';selected='33';}
      else if(fitting){const group=lightingGroups.find(group=>group.items.includes(fitting.id));if(group||fitting.id==='33'){service='lights';lightingGroup=group?.id||'ceiling';selected=fitting.id;}}
    }
  } catch { notice('This project link could not be read. An empty project is shown.'); }
}
readLink();
for(const [id,name] of categories) {
  const button=element('button',name);button.type='button';button.dataset.service=id;
  button.addEventListener('click',()=>{if(id==='automation'&&service!==id)$('quantity').value='1';service=id;selected=id==='showers'?'5':id==='lights'?(lightingItemIds(lightingGroup)[0]||'4'):id==='fans'?'14':id==='automation'?'33':id==='cookers'?'21':'2';renderSelection();});
  $('services').append(button);
}
for(const group of lightingGroups) {
  const button=element('button',group.name);button.type='button';button.dataset.lighting=group.id;
  button.addEventListener('click',()=>{lightingGroup=group.id;selected=lightingItemIds(group.id)[0]||'4';renderSelection();});
  $('lighting-categories').append(button);
}
for(const [i,t] of data.travel.entries()) $('location').append(option(i,t.name));
for(const area of data.areas) $('area').append(option(area,area));
for(let n=4;n<=21;n++) {
  const button=element('button',`${n}-way`);button.type='button';button.dataset.ways=n;
  button.addEventListener('click',()=>{boardSize=n;renderSelection();});$('board-sizes').append(button);
}
function fittingList() {
  if(service==='lights')return lightingItemIds(lightingGroup).map(id=>data.fixed.find(item=>item.id===id)).filter(Boolean);
  return data.fixed.filter(f=>service==='sockets'?socketIds.includes(f.id):service==='showers'?Number(f.id)>=5&&Number(f.id)<=13:service==='cookers'?['21','22'].includes(f.id):service==='lights'?lightingItemIds(lightingGroup).includes(f.id):service==='fans'?fanItems.includes(f.id):service==='automation'?f.id==='33':false);
}
function renderSelection() {
  const board=service==='boards', wallQuote=service==='lights'&&lightingGroup==='wall'&&!lightingItemIds('wall').length, quoteOnly=['cable','cctv'].includes(service)||wallQuote;
  $('route-panel').hidden=board;
  const lighting=service==='lights';
  $('lighting-group-config').hidden=!(lighting||service==='automation');
  $('automation-choice').hidden=!lighting;
  $('switch-choice').hidden=!lighting;
  $('switch-fields').hidden=!lighting||!$('light-switches').checked;
  $('quantity-label').textContent=service==='automation'?'Groups or clusters':'Quantity';
  $('supply').closest('label').hidden=service==='automation';
  $('lighting-categories').hidden=!lighting;
  $('lighting-note').hidden=!lighting;
  $('lighting-note').textContent=lighting?lightingGroups.find(group=>group.id===lightingGroup).note:'';
  for(const button of $('lighting-categories').children)button.setAttribute('aria-pressed',String(button.dataset.lighting===lightingGroup));
  if(!board&&!quoteOnly&&!fittingList().some(item=>item.id===selected))selected=fittingList()[0].id;
  const customerOnly=data.fixed.find(item=>item.id===selected)?.customerOnly&&!board&&!quoteOnly;
  $('supply').disabled=!!customerOnly;
  $('supply').options[0].disabled=!!customerOnly;
  $('supply').value=customerOnly?'customer':supplyPreference;
  $('service-photo').hidden=!quoteOnly;
  const photo=quoteOnly?servicePhotos[service]:null;
  if(photo) {
    $('service-photo-image').src=photo.src;
    $('service-photo-image').alt=photo.label;
  }
  for(const button of $('services').children)button.setAttribute('aria-pressed',String(button.dataset.service===service));
  $('socket-mode').hidden=service!=='sockets';$('product-grid').hidden=board||quoteOnly;
  $('board-config').hidden=!board;$('fitting-config').hidden=board||quoteOnly;$('add-item').hidden=quoteOnly;$('selection-price').hidden=quoteOnly;$('quote-only').hidden=!quoteOnly;
  $('service-kicker').textContent=categories.find(c=>c[0]===service)[1].toUpperCase();
  $('select-title').textContent=board?'Choose your fuseboard':wallQuote?'Wall lighting':quoteOnly?'Tell us what you need':service==='automation'?'Lighting automation':service==='fans'?'Choose your fan':lighting?`Choose your ${lightingGroups.find(group=>group.id===lightingGroup).name.toLowerCase()} lighting`:'Pick your requirement';
  document.querySelector('.section-heading .pill').hidden=quoteOnly;
  document.querySelector('.section-heading .pill').textContent=service==='automation'?'£40 per group or cluster':customerOnly?'Installation only · customer supplied':'Supply & installation';
  for(const b of $('socket-mode').querySelectorAll('[data-mode]'))b.setAttribute('aria-pressed',String(b.dataset.mode===mode));
  if(quoteOnly) {
    $('quote-service').textContent=wallQuote?'Wall light installation':service==='cable'?'Cable supply':'CCTV installation';
    $('quote-service-copy').textContent=wallQuote?'You supply the decorative wall lights. Installation is £15 per fitting, with cable routing added separately.':service==='cable'?'Tell us the cable type, size and length you need. Call for a supply quote.':'Tell us the areas you want covered and whether you already have a system. Call for a tailored quote.';
    return;
  }
  if(board) {
    for(const b of $('board-sizes').children)b.setAttribute('aria-pressed',String(Number(b.dataset.ways)===boardSize));
    $('prev-board').disabled=boardSize===4;$('next-board').disabled=boardSize===21;
    $('board-poster').src=`assets/${boardSize}-way.jpg`;$('poster-link').href=`assets/${boardSize}-way.jpg`;
    $('board-poster').alt=`Juswrk ${boardSize}-way fuseboard replacement advert`;$('board-name').textContent=`${boardSize} protected circuits`;
  } else {
    $('product-grid').replaceChildren();
    for(const f of fittingList()) {
      if(lighting&&f.id==='33')$('product-grid').append(element('h3','Lighting controls','lighting-control-heading'));
      const button=element('button',undefined,'product');button.type='button';button.setAttribute('aria-pressed',String(f.id===selected));
      const image=element('img',undefined,'product-photo');image.src=f.id==='4'?'assets/item-04-white-pendant.jpg':`assets/item-${f.id.padStart(2,'0')}.jpg`;image.alt='';image.loading='lazy';image.width=512;image.height=512;
      button.append(image,element('span',f.name),element('span',money(f[f.customerOnly?'customer':$('supply').value]),'product-price'));
      if(securityLightIds.includes(f.id))button.append(element('span','Automation add-on available for this product','automation-badge'));
      if(f.customerOnly)button.append(element('small','Illustrative fitting · you supply the light','muted'));
      button.addEventListener('click',()=>{selected=f.id;renderSelection();});$('product-grid').append(button);
    }
  }
  const item=selectionItem(),detail=itemDetails(item);
  const auto=lighting&&$('light-automation').checked;
  const namedGroup=$('light-group-name').value.trim().toLowerCase();
  const existing=!!namedGroup&&state.cart.some(line=>line.id==='33'&&line.groupName?.trim().toLowerCase()===namedGroup);
  const alreadyAutomated=service==='automation'&&existing;
  $('add-item').disabled=alreadyAutomated;
  const addedAutomation=auto&&!existing?40:0;
  const label=alreadyAutomated?'Automation is already included for this group':board?'Package price':service==='automation'?`${item.qty} group${item.qty===1?'':'s'} · £40 each`:`${item.qty} ${item.qty===1?'fitting':'fittings'} · ${money(detail.rate)} each${auto?(existing?' · automation already in this group':' + £40 automation for this group'):''}`;
  $('selection-price').replaceChildren(element('span',label),element('strong',money(alreadyAutomated?0:detail.total+addedAutomation)));

}
function selectionItem(){return service==='boards'?{type:'board',ways:boardSize,qty:1}:{type:'fitting',id:selected,supply:$('supply').value,qty:bounded($('quantity'),1,100,true),mode};}
function groupOptions(){return {groupName:$('light-group-name').value.trim(),automation:$('light-automation').checked,switchesRequired:$('light-switches').checked,switchLocations:bounded($('switch-locations'),1,10,true),switchType:$('switch-type').value};}
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
    const remove=element('button','Remove','remove');remove.type='button';remove.setAttribute('aria-label',`Remove ${detail.name}`);remove.addEventListener('click',()=>{state.cart=removeProjectSelection(state.cart,index);isExample=false;renderEstimate();renderSelection();});row.append(remove);$('cart').append(row);
  });
  $('breakdown').replaceChildren();costLine($('breakdown'),'Shared route installation',result.routing);
  if(state.materials==='extra')costLine($('breakdown'),'Cable materials allowance',result.cable);
  costLine($('breakdown'),'Travel',result.travel);
  if(state.extras)costLine($('breakdown'),'Other agreed work',state.extras);
  if(state.testing)costLine($('breakdown'),'Additional testing',state.testing);
  if(state.vat)costLine($('breakdown'),`VAT · ${state.vat}%`,result.vat);
  $('grand-total').textContent=money(result.total);$('grand-total').previousElementSibling.textContent=result.switchingPending?'Estimated total (excludes switching)':'Estimated total';$('switching-pending').hidden=!result.switchingPending;$('route-total').textContent=`${result.metres} m route · ${result.cableMetres} m cable`;
  $('empty-note').textContent=!result.active?'Add fittings or route sections to build your estimate.':'';
  $('view-quote').disabled=!result.active;$('share').disabled=!result.active;
  $('rate-label').hidden=state.materials!=='extra';
}
function syncInputs() {
  $('location').value=state.location;$('area').value=state.area;$('material-mode').value=state.materials;
  for(const [id,key] of [['cable-rate','cableRate'],['allowance','allowance'],['extras','extras'],['testing','testing'],['vat','vat']])$(id).value=state[key];
}
$('socket-mode').addEventListener('click',event=>{const button=event.target.closest('[data-mode]');if(button){mode=button.dataset.mode;renderSelection();}});
for(const id of ['light-automation','light-switches','switch-type','switch-locations','light-group-name'])$(id).addEventListener(id==='light-group-name'?'input':'change',renderSelection);
$('supply').addEventListener('change',()=>{supplyPreference=$('supply').value;renderSelection();});$('quantity').addEventListener('change',()=>{$('quantity').value=bounded($('quantity'),1,100,true);renderSelection();});
for(const [id,step] of [['less',-1],['more',1]])$(id).addEventListener('click',()=>{$('quantity').value=Math.min(100,Math.max(1,Number($('quantity').value)+step));renderSelection();});
$('prev-board').addEventListener('click',()=>{boardSize=Math.max(4,boardSize-1);renderSelection();});$('next-board').addEventListener('click',()=>{boardSize=Math.min(21,boardSize+1);renderSelection();});
$('add-item').addEventListener('click',()=>{
  const item=selectionItem(),next=service==='lights'||service==='automation'?addProjectSelection(state.cart,item,groupOptions()):[...state.cart,item];
  if(next===state.cart){notice('Automation is already included for this group.');return;}
  if(next.length>50){notice('Your project has reached 50 item lines.');return;}
  state.cart=next;isExample=false;renderEstimate();renderSelection();notice('Added to your project.');
});
$('add-route').addEventListener('click',()=>{if(state.routes.length>=30){notice('Your project has reached 30 route sections.');return;}state.routes.push({id:'3',metres:0,cables:1});isExample=false;renderRoutes();renderEstimate();});
$('location').addEventListener('change',()=>{state.location=Number($('location').value);renderEstimate();});$('area').addEventListener('change',()=>{state.area=$('area').value;});
$('material-mode').addEventListener('change',()=>{state.materials=$('material-mode').value;renderEstimate();});
for(const [id,key,max] of [['cable-rate','cableRate',100000],['allowance','allowance',100000],['extras','extras',100000],['testing','testing',100000],['vat','vat',100]])$(id).addEventListener('input',()=>{state[key]=bounded($(id),0,max);renderEstimate();});
$('reset').addEventListener('click',()=>{state={...example(),cart:[],routes:[],location:0,materials:'included',cableRate:0,allowance:0,extras:0,testing:0,vat:0};isExample=false;$('light-automation').checked=false;$('light-switches').checked=false;$('light-group-name').value='';$('switch-locations').value='1';$('quantity').value='1';history.replaceState(null,'',location.pathname+location.search);renderSelection();syncInputs();renderRoutes();renderEstimate();notice('Ready for a new project.');});
$('share').addEventListener('click',async()=>{
  const url=new URL(location.href);url.hash='project='+encodeURIComponent(JSON.stringify(state));
  try { await navigator.clipboard.writeText(url.href);history.replaceState(null,'',url.href);notice('Project link copied. You can paste it into Facebook or a message.'); }
  catch { const input=element('input');input.value=url.href;input.readOnly=true;input.setAttribute('aria-label','Project link to copy');$('feedback').replaceChildren(element('span','Copy this project link'),input);input.focus();input.select(); }
});
function quoteLine(name,basis,price) { const row=element('div',undefined,'quote-item'),description=element('div',name);if(basis)description.append(element('small',basis));row.append(description,element('strong',money(price)));$('quote-content').append(row); }
$('view-quote').addEventListener('click',()=>{
  $('quote-status').textContent='';
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
  const total=element('div',undefined,'grand-total');total.append(element('span',result.switchingPending?'Estimated total (excludes switching)':'Estimated total'),element('strong',money(result.total)));$('quote-content').append(total);$('quotation').showModal();
});
$('close-quote').addEventListener('click',()=>$('quotation').close());$('print-quote').addEventListener('click',()=>window.print());
$('accept-quote').addEventListener('click',()=>{
  const name=$('customer-name').value.trim(),contact=$('customer-contact').value.trim();
  if(!name||!contact){$('quote-status').textContent='Add your name and email address before accepting.';(!name?$('customer-name'):$('customer-contact')).focus();return;}
  if(!$('customer-contact').checkValidity()){$('customer-contact').reportValidity();return;}
  const reference=$('reference').value.trim();
  const body=[
    'QUOTATION ACCEPTANCE REQUEST',
    'I would like to proceed with the electrical work below, subject to site survey and final confirmation.',
    '',`Customer: ${name}`,`Customer email (copied): ${contact}`,`Reference: ${reference||'Not provided'}`,
    `Date: ${new Date().toLocaleString('en-GB')}`,'',
    ...Array.from($('quote-content').children,child=>child.innerText),
    '',$('quotation').querySelector('.scope').textContent,
    '',`Project link: ${location.href.split('#')[0]}#project=${encodeURIComponent(JSON.stringify(state))}`,
  ].join('\n');
  $('quote-status').textContent='Your acceptance email is ready. Tap Send in Gmail or your email app. The message is addressed to Juswrk with your email in CC so you both receive a copy. Attach your saved PDF if needed. It has not been sent yet.';
  window.location.href=`mailto:4siteonline@gmail.com?cc=${encodeURIComponent(contact)}&subject=${encodeURIComponent('Juswrk quotation acceptance'+(reference?' - '+reference:''))}&body=${encodeURIComponent(body)}`;
});
async function quotationFile() {
  const quote={
    customer:$('customer-name').value.trim(),contact:$('customer-contact').value.trim(),reference:$('reference').value.trim(),
    blocks:Array.from($('quote-content').children,child=>child.innerText),
    scope:$('quotation').querySelector('.scope').textContent,
  };
  const response=await fetch('assets/juswrk-logo.png');
  if(!response.ok)throw new Error('Logo could not be loaded');
  const bytes=await buildQuotePdf(globalThis.PDFLib,quote,await response.arrayBuffer());
  const reference=quote.reference.replace(/[^a-z0-9_-]/gi,'-').slice(0,60);
  return new File([bytes],`Juswrk-quotation-${reference||new Date().toISOString().slice(0,10)}.pdf`,{type:'application/pdf'});
}
function downloadQuotation(file) {
  const url=URL.createObjectURL(file),link=document.createElement('a');
  link.href=url;link.download=file.name;document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
}
$('save-quote').addEventListener('click',async()=>{
  const button=$('save-quote');button.disabled=true;
  try{downloadQuotation(await quotationFile());$('quote-status').textContent='PDF download started. You can attach it in Gmail and send a copy to 4siteonline@gmail.com.';}
  catch{$('quote-status').textContent='The PDF could not be created. Please try again or use Print and choose Save as PDF.';}
  finally{button.disabled=false;}
});
$('email-quote').addEventListener('click',async()=>{
  const button=$('email-quote');button.disabled=true;
  try{
    const file=await quotationFile();
    if(navigator.canShare?.({files:[file]})){
      await navigator.share({files:[file],title:'Juswrk quotation',text:'Please send a copy of this quotation to 4siteonline@gmail.com.'});
      $('quote-status').textContent='PDF shared. Send the message in Gmail to email your copy.';
    } else {
      downloadQuotation(file);
      $('quote-status').textContent='PDF download started. Attach this file to the prepared email before sending. Nothing has been sent automatically.';
      const subject=encodeURIComponent('Juswrk quotation'+($('reference').value.trim()?' - '+$('reference').value.trim():''));
      const body=encodeURIComponent('Please find the Juswrk quotation attached.\n\nAttach the saved PDF before sending.');
      window.location.href=`mailto:4siteonline@gmail.com?subject=${subject}&body=${body}`;
    }
  }catch(error){if(error.name!=='AbortError')$('quote-status').textContent='Sharing is not available here. Use Save PDF, then attach it in Gmail and send it to 4siteonline@gmail.com.';}
  finally{button.disabled=false;}
});
window.addEventListener('hashchange',()=>{readLink();renderSelection();syncInputs();renderRoutes();renderEstimate();});
renderSelection();syncInputs();renderRoutes();renderEstimate();
