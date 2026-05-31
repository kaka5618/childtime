const themes = [
  {
    id: 'star_dream_bubble',
    name: '星梦泡泡',
    shortName: '星梦',
    status: 'active',
    description: '软乎乎的泡泡精灵，收集星光和糖果色的梦。',
    accent: '#7BA68C',
    coverClass: 'bubble-cover',
    previewCardIds: ['bubble_n_001', 'bubble_r_021', 'bubble_sr_037']
  },
  {
    id: 'dinosaur_age',
    name: '恐龙纪元',
    shortName: '恐龙',
    status: 'preview',
    description: '远古巨兽和化石探险，像纪录片一样展开。',
    accent: '#9A7A4F',
    coverClass: 'dino-cover',
    previewCardIds: []
  },
  {
    id: 'deep_space_mecha',
    name: '深空机甲',
    shortName: '机甲',
    status: 'preview',
    description: '探索型机甲和星际基地，偏硬朗科幻感。',
    accent: '#5F86B8',
    coverClass: 'mecha-cover',
    previewCardIds: []
  },
  {
    id: 'garden_whisper',
    name: '花园蜜语',
    shortName: '花园',
    status: 'preview',
    description: '住在花瓣里的小花灵，水彩童话气质。',
    accent: '#D58AA5',
    coverClass: 'garden-cover',
    previewCardIds: []
  }
]

function getTheme(id) {
  return themes.find((theme) => theme.id === id)
}

function getActiveTheme() {
  return themes.find((theme) => theme.status === 'active')
}

module.exports = {
  themes,
  getTheme,
  getActiveTheme
}
