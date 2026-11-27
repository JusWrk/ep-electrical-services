import { data } from './data.js';
export const money = value => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 2 }).format(value);
export const example = () => ({ version: 1, cart: [{ type: 'fitting', id: '3', supply: 'supply', qty: 5, mode: 'new' }], routes: [{ id: '4', metres: 3, cables: 1 }, { id: '9', metres: 5, cables: 1 }, { id: '11', metres: 7, cables: 1 }], location: 1, area: 'Living room', materials: 'included', cableRate: 0, allowance: 0, extras: 0, testing: 0, vat: 0 });
const finite = (value, min, max) => Number.isFinite(value) && value >= min && value <= max;
export function validState(s) {
  return s?.version === 1 && Array.isArray(s.cart) && s.cart.length <= 50 && s.cart.every(i => Number.isInteger(i.qty) && finite(i.qty, 1, 100) && (i.type === 'board' ? data.boards.some(b => b.ways === i.ways && b.ways <= 15) : i.type === 'fitting' && data.fixed.some(f => f.id === i.id) && ['supply','customer'].includes(i.supply) && ['new','replace'].includes(i.mode))) && Array.isArray(s.routes) && s.routes.length <= 30 && s.routes.every(r => data.routes.some(d => d.id === r.id) && finite(r.metres, 0, 10000) && Number.isInteger(r.cables) && finite(r.cables,1,100)) && Number.isInteger(s.location) && data.travel[s.location] && data.areas.includes(s.area) && ['included','extra'].includes(s.materials) && ['cableRate','allowance','extras','testing','vat'].every(k => finite(s[k],0,k==='vat'?100:100000));
}
export function itemDetails(item) {
  if (item.type === 'board') {
    const board = data.boards.find(b => b.ways === item.ways);
    return { name: `${board.ways}-way RCBO fuseboard`, basis: 'Supplied & installed', rate: board.price, total: board.price * item.qty };
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
  const cable = s.materials === 'extra' ? cableMetres*s.cableRate : 0;
  const active = s.cart.length > 0 || metres > 0 || s.extras > 0 || s.testing > 0;
  const travel = active ? data.travel[s.location].price : 0;
  const subtotal = fittings + routing + cable + travel + s.extras + s.testing;
  const vat = subtotal*s.vat/100;
  return { items, routeLines, fittings, routing, metres, cableMetres, cable, travel, subtotal, vat, total: subtotal+vat, active };
}
