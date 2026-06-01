const state = require('./state')

const BUNDLED_VOICE_FILES_READY = false

const voiceCopy = {
  taskStart: '开始啦，加油。',
  taskComplete: '完成一项，能量又涨了一截。',
  allComplete: '能量满了，快去开包吧。'
}

const voiceFiles = {
  gentle: {
    taskStart: '/assets/audio/gentle/task-start.mp3',
    taskComplete: '/assets/audio/gentle/task-complete.mp3',
    allComplete: '/assets/audio/gentle/all-complete.mp3'
  },
  bright: {
    taskStart: '/assets/audio/bright/task-start.mp3',
    taskComplete: '/assets/audio/bright/task-complete.mp3',
    allComplete: '/assets/audio/bright/all-complete.mp3'
  }
}

function getVoiceSettings() {
  return state.getSettings()
}

function canPlayVoice() {
  return getVoiceSettings().voiceEnabled
}

function getVoiceCopy(type) {
  return voiceCopy[type] || ''
}

function getVoiceFile(type) {
  if (!BUNDLED_VOICE_FILES_READY) return ''
  const settings = getVoiceSettings()
  const files = voiceFiles[settings.voiceType] || voiceFiles.gentle
  return files[type] || ''
}

function playVoice(type) {
  const settings = getVoiceSettings()
  const src = getVoiceFile(type)

  if (!settings.voiceEnabled || !src || !wx.createInnerAudioContext) return null

  const audio = wx.createInnerAudioContext()
  audio.src = src
  audio.volume = Math.max(0, Math.min(1, Number(settings.volume || 0) / 100))
  audio.onEnded(() => audio.destroy())
  audio.onError(() => audio.destroy())
  audio.play()
  return audio
}

module.exports = {
  canPlayVoice,
  getVoiceCopy,
  getVoiceFile,
  getVoiceSettings,
  playVoice
}
