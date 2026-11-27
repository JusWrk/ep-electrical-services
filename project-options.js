export const socketIds = ['2','3','35','36'];
export const lightIds = ['4','23','24','25','26','27','28','29','30','31','32','34'];
export const securityLightIds = ['23','24','25','26','27','28','29','30','31','32'];
export const isLightingItem = id => lightIds.includes(id);
const key = name => (name || '').trim().toLowerCase();
export function addProjectSelection(cart, item, options = {}) {
  if(item.id==='33'&&options.groupName?.trim()&&cart.some(i=>i.id==='33'&&key(i.groupName)===key(options.groupName)))return cart;
  if (!isLightingItem(item.id)) return [...cart,{...item,...(item.id==='33'&&options.groupName?.trim()?{groupName:options.groupName.trim()}: {})}];
  let groupName=(options.groupName||'').trim();
  if(!groupName){let n=1;while(cart.some(i=>key(i.groupName)===`lighting group ${n}`))n++;groupName=`Lighting group ${n}`;}
  const line={...item,groupName};
  if(options.switchesRequired){line.switchesRequired=true;line.switchLocations=options.switchLocations;line.switchType=options.switchType;}
  const result=[...cart,line];
  if(options.automation&&!cart.some(i=>i.type==='fitting'&&i.id==='33'&&key(i.groupName)===key(groupName)))
    result.push({type:'fitting',id:'33',supply:'supply',qty:1,mode:'replace',groupName});
  return result;
}
export function removeProjectSelection(cart, index) {
  const removed=cart[index],result=cart.filter((_,i)=>i!==index);
  if(isLightingItem(removed?.id)&&removed.groupName&&!result.some(i=>isLightingItem(i.id)&&key(i.groupName)===key(removed.groupName)))
    return result.filter(i=>!(i.id==='33'&&key(i.groupName)===key(removed.groupName)));
  return result;
}
