import { data } from './data.js';
export const money = value => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 2 }).format(value);
export const example = () => ({ version: 1, cart: [{ type: 'fitting', id: '2', supply: 'supply', qty: 1, mode: 'replace' }], routes: [], location: 0, area: 'Living room', materials: 'included', cableRate: 0, allowance: 0, extras: 0, testing: 0, vat: 0 });
const finite = (value, min, max) => Number.isFinite(value) && value >= min && value <= max;
export function validState(s) {
  return s?.version === 1 && Array.isArray(s.cart) && s.cart.length <= 50 && s.cart.every(i => Number.isInteger(i.qty) && finite(i.qty, 1, 100) && (i.type === 'board' ? data.boards.some(b => b.ways === i.ways && b.ways <= 15) : i.type === 'fitting' && data.fixed.some(f => f.id === i.id) && ['supply','customer'].includes(i.supply) && ['new','replace'].includes(i.mode))) && Array.isArray(s.routes) && s.routes.length <= 30 && s.routes.every(r => data.routes.some(d => d.id === r.id) && finite(r.metres, 0, 10000) && Number.isInteger(r.cables) && finite(r.cables,1,100)) && Number.isInteger(s.location) && data.travel[s.location] && data.areas.includes(s.area) && ['included','extra'].includes(s.materials) && ['cableRate','allowance','extras','testing','vat'].every(k => finite(s[k],0,k==='vat'?100:100000));
}
export function itemDetails(item) {
  if (item.type === 'board') {
    const board = data.boards.find(b => b.ways === item.ways);
    return { name: `${board.ways}-way RCBO fuseboard`, basis: 'Supply, installation, testing & certification included', rate: board.price, total: board.price * item.qty };
  }
  const fitting = data.fixed.find(f => f.id === item.id);
  return { name: fitting.name, basis: `${item.supply === 'supply' ? 'Juswrk supplied' : 'Customer supplied'}${['2','3'].includes(item.id) ? ` · ${item.mode === 'new' ? 'New position' : 'Front replacement'}` : ''}`, rate: fitting[item.supply], total: fitting[item.supply] * item.qty };
}
export function calculate(s) {
  const items = s.cart.map(itemDetails);
  const routeLines = s.routes.map(r => ({ ...r, ...data.routes.find(d => d.id === r.id), total: data.routes.find(d => d.id === r.id).rate * r.metres }));
  const fittings = items.reduce((sum,i) => sum + i.total,0);
  const routing = routeLines.reduce((sum,r) => sum + r.total,0);
  const metres = routeLines.reduce((sum,r) => sum + r.metres,0);
  const cableMetres = routeLines.reduce((sum,r) => sum + r.metres*r.cables,0) + s.allowance;
  const cable = s.materials === 'extra' ? s.cableRate : 0;
  const active = s.cart.length > 0 || metres > 0 || s.extras > 0 || s.testing > 0;
  const travel = active ? data.travel[s.location].price : 0;
  const subtotal = fittings + routing + cable + travel + s.extras + s.testing;
  const vat = subtotal*s.vat/100;
  return { items, routeLines, fittings, routing, metres, cableMetres, cable, travel, subtotal, vat, total: subtotal+vat, active };
}

export function routeMix(routes) {
  const grouped = new Map();
  for (const route of routes) {
    if (route.metres <= 0) continue;
    const entry = grouped.get(route.id) ?? { id: route.id, name: route.name, metres: 0 };
    entry.metres += route.metres;
    grouped.set(route.id, entry);
  }
  const entries = [...grouped.values()];
  const total = entries.reduce((sum, entry) => sum + entry.metres, 0);
  if (!total) return [];
  const shares = entries.map(entry => {
    const exact = entry.metres / total * 1000;
    return { ...entry, tenths: Math.floor(exact), remainder: exact % 1 };
  });
  const unallocated = 1000 - shares.reduce((sum, share) => sum + share.tenths, 0);
  const ranked = [...shares].sort((a, b) => b.remainder - a.remainder);
  for (let index = 0; index < unallocated; index++) ranked[index].tenths += 1;
  return shares.map(share => ({ id: share.id, name: share.name, percentage: share.tenths / 10 }));
}
