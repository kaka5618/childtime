const names = [
  '棉花泡泡', '薄荷泡泡', '草莓泡泡', '牛奶泡泡', '蓝莓泡泡',
  '蜜桃泡泡', '云朵泡泡', '晚安泡泡', '晨光泡泡', '奶油泡泡',
  '小星泡泡', '糖霜泡泡', '柠檬泡泡', '雪团泡泡', '香草泡泡',
  '布丁泡泡', '软糖泡泡', '铃兰泡泡', '奶茶泡泡', '星尘小泡',
  '果冻星泡', '彩虹咕噜', '珍珠泡泡', '雨滴泡泡', '星铃泡泡',
  '蜂蜜星泡', '泡泡糖星', '海盐泡泡', '星莓泡泡', '奶盖泡泡',
  '水晶泡泡', '小雨星彩', '星露泡泡', '糖果流星', '泡泡乐谱',
  '星星汽水', '月光泡泡王子', '星河摇篮', '彩虹梦泡', '流星泡泡使',
  '银铃星泡', '云梦守护泡', '星雾泡泡', '月桂泡泡', '极光星泡',
  '星糖泡泡师', '星梦泡泡王', '彩虹星冕泡', '银河摇梦兽', '永夜星愿泡'
]

function rarityForNumber(number) {
  if (number >= 47) return 'SSR'
  if (number >= 37) return 'SR'
  if (number >= 21) return 'R'
  return 'N'
}

function prefixForRarity(rarity) {
  return rarity.toLowerCase()
}

function pad(number) {
  return String(number).padStart(3, '0')
}

function buildCard(number) {
  const rarity = rarityForNumber(number)
  const id = `bubble_${prefixForRarity(rarity)}_${pad(number)}`
  const image = '/assets/cards/card-placeholder.jpg'
  return {
    id,
    number,
    no: `No.${String(number).padStart(2, '0')}`,
    name: names[number - 1],
    rarity,
    image,
    imageUrl: image,
    seriesId: 'star_dream_bubble'
  }
}

const cards = Array.from({ length: 50 }, (_, index) => buildCard(index + 1))
const seriesCards = {
  star_dream_bubble: cards
}

function getCardsBySeries(seriesId) {
  return seriesCards[seriesId] || []
}

function getCard(seriesId, cardId) {
  if (!cardId) {
    return cards.find((card) => card.id === seriesId)
  }
  return getCardsBySeries(seriesId).find((card) => card.id === cardId)
}

module.exports = {
  cards,
  seriesCards,
  getCardsBySeries,
  getCard
}
