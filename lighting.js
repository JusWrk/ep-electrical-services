export const lightingGroups = [
  {id:'wall',name:'Wall',items:['34'],note:'Customer-supplied decorative wall lights. £15 installation per fitting; cable routing is added separately.'},
  {id:'ceiling',name:'Ceiling',items:['4'],note:'Pendant and ceiling light fittings.'},
  {id:'security',name:'Security',items:['28','29','30','31','32'],note:'Security lights with PIR motion detection.'},
  {id:'flood',name:'Flood',items:['23','24','25','26','27'],note:'Floodlights without a PIR motion detector.'},
];
export const fanItems = ['14','15','16','17','18','19','20'];
export function lightingItemIds(group){
  const category=lightingGroups.find(item=>item.id===group);
  return category?.items.length?[...category.items]:[];
}
