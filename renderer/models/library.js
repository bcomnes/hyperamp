var libStream = require('../lib/library')
var config = require('electron').remote.require('./config.js')
var ipcRenderer = require('electron').ipcRenderer

module.exports = {
  namespace: 'library',
  state: {
    files: [],
    search: ''
  },
  reducers: {
    files: (state, data) => ({ files: data }),
    metadata: (state, data) => ({ files: state.files.concat(data) }),
    search: (state, data) => ({ search: data }),
    clear: (state, data) => ({ files: [] })
  },
  effects: {
    // TODO Implement proper state management for folder walking
    loadSongs: (state, data, send, done) => {
      send('library:clear', (err) => {
        if (err) return done(err)
        libStream(config.get('music'), (err, metadata) => {
          if (err) return done(err)
          send('library:metadata', metadata, err => {
            if (err) return done(err)
            send('library:sort', done)
          })
        })
      })
    },
    sort: (state, data, send, done) => {
      send('library:files', sortList(state.files), done)
    }
  },
  subscriptions: {
    'called-once-when-the-app-loads': (send, done) => {
      ipcRenderer.send('sync-state')
      done()
    },
    syncState: (send, done) => {
      ipcRenderer.on('sync-state', (ev, state) => {
        send('library:files', state.playlist, done)
      })
    }
  }
}

// TODO: expose sort to state to allow sort using column headers
function sortList (files) {
  return files.sort((a, b) => {
    // sort by artist
    if (a.artist < b.artist) return -1
    if (a.artist > b.artist) return 1

    // then by album
    if (a.album < b.album) return -1
    if (a.album > b.album) return 1

    // then by title
    if (a.title < b.title) return -1
    if (a.title > b.title) return 1
    return 0
  })
}
