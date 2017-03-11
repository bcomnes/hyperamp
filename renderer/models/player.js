var { ipcRenderer } = require('electron')
var parallel = require('run-parallel')

module.exports = {
  namespace: 'player',
  state: {
    playing: false,
    current: {},
    volume: 50,
    muted: false,
    position: 0,
    currentTime: 0
  },
  reducers: {
    muted: (state, data) => ({ muted: data }),
    playing: (state, data) => ({playing: data}),
    position: (state, data) => data,
    currentTime: (state, data) => ({ currentTime: data }),
    volume: (state, data) => ({ volume: data }),
    current: (state, data) => ({current: data})
  },
  effects: {
    queue: (state, data, send, done) => {
      ipcRenderer.send('queue', data)
      send('player:current', data, done)
    },
    play: (state, data, send, done) => {
      ipcRenderer.send('play')
      send('player:playing', true, done)
    },
    pause: (state, data, send, done) => {
      ipcRenderer.send('pause')
      send('player:playing', false, done)
    },
    prev: (state, data, send, done) => {
      ipcRenderer.send('prev')
      done()
    },
    next: (state, data, send, done) => {
      ipcRenderer.send('next')
      done()
    },
    mute: (state, data, send, done) => {
      ipcRenderer.send('mute')
      send('player:muted', true, done)
    },
    unmute: (state, data, send, done) => {
      ipcRenderer.send('unmute')
      send('player:muted', false, done)
    },
    updatePlaylist: (state, data, send, done) => {
      ipcRenderer.send('playlist', data)
      done()
    },
    changeVolume: (state, data, send, done) => {
      ipcRenderer.send('volume', data)
      send('player:volume', data, done)
    }
  },
  subscriptions: {
    play: (send, done) => {
      ipcRenderer.on('play', (ev) => {
        send('player:playing', true, done)
      })
    },
    pause: (send, done) => {
      ipcRenderer.on('pause', (ev) => {
        send('player:playing', false, done)
      })
    },
    queue: (send, done) => {
      ipcRenderer.on('queue', (ev, meta) => {
        send('player:current', meta, done)
      })
    },
    mute: (send, done) => {
      ipcRenderer.on('mute', (ev) => {
        send('player:muted', true, done)
      })
    },
    unmute: (send, done) => {
      ipcRenderer.on('unmuted', (ev) => {
        send('player:muted', false, done)
      })
    },
    volume: (send, done) => {
      ipcRenderer.on('volume', (ev, level) => {
        send('player:volume', level, done)
      })
    },
    timeupdate: (send, done) => {
      ipcRenderer.on('timeupdate', (ev, currentTime) => {
        send('player:currentTime', currentTime, done)
      })
    },
    syncState: (send, done) => {
      ipcRenderer.on('sync-state', (ev, state) => {
        console.log(state)
        parallel([
          send.bind(null, 'player:current', state.current),
          send.bind(null, 'player:volume', state.volume),
          send.bind(null, 'player:muted', state.muted),
          send.bind(null, 'player:playing', state.playing)
        ], done)
      })
    }
  }
}
