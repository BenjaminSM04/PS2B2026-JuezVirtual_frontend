// Umbrales de desbloqueo; deben coincidir con practice/services.py del backend.
export const STAGES = [
  {name: 'egg', from: 0},
  {name: 'baby', from: 1},
  {name: 'juvenile', from: 10},
  {name: 'adult', from: 30}
]

export const COLORS = [
  {name: 'green', from: 0},
  {name: 'blue', from: 5},
  {name: 'amber', from: 15},
  {name: 'violet', from: 30}
]

export const ACCESSORIES = [
  {name: 'none', from: 0},
  {name: 'scarf', from: 5},
  {name: 'glasses', from: 15},
  {name: 'backpack', from: 30}
]

export const PALETTES = {
  green: {body: '#5aa469', shade: '#3e7d4c', belly: '#dcf2cf'},
  blue: {body: '#4f8fc0', shade: '#356c96', belly: '#d7ebf7'},
  amber: {body: '#d99a2b', shade: '#a8721a', belly: '#fbe9c4'},
  violet: {body: '#9a6cc4', shade: '#7449a0', belly: '#ecdcf7'}
}

export function stageProgress (solved) {
  const index = STAGES.reduce((found, stage, position) => solved >= stage.from ? position : found, 0)
  const next = STAGES[index + 1]
  if (!next) return {current: STAGES[index].name, next: null, remaining: 0, ratio: 1}
  const span = next.from - STAGES[index].from
  return {
    current: STAGES[index].name,
    next: next.name,
    remaining: next.from - solved,
    ratio: Math.min(1, Math.max(0, (solved - STAGES[index].from) / span))
  }
}
