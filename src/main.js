// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})

// localStorage persistence
var STORAGE_KEY = 'songs-vuejs-2.0'
var songStorage = {
  fetch: function () {
    var songs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    songs.forEach(function (song, index) {
      song.id = index
    })
    songStorage.uid = songs.length
    return songs
  },
  save: function (songs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songs))
  }
}

// visibility filters
var filters = {
  all: function (songs) {
    return songs
  },
  active: function (songs) {
    return songs.filter(function (song) {
      return !song.completed
    })
  },
  completed: function (songs) {
    return songs.filter(function (song) {
      return song.completed
    })
  }
}

// app instance
var app = new Vue({
  // app initial static
  data: {
    songs: songStorage.fetch(),
    newSong: '',
    editedSong: 'null',
    visibility: 'all'
  },

  // watch songs for localStorage persistence
  watch: {
    songs: {
      handler: function (songs) {
        songStorage.save(songs)
      },
      deep: true
    }
  },

  // computed properties
  computed: {
    filteredSongs: function () {
      return filters[this.visibility](this.songs)
    },
    remaining: function () {
      return filters.active(this.songs).length
    },
    allDone: {
      get: function () {
        return this.remaining === 0
      },
      set: function (value) {
        this.songsforEach(function (song) {
          song.completed = value
        })
      }
    }
  },

  filters: {
    pluralize: function (n) {
      return n === 1 ? 'item' : 'items'
    }
  },

  // methods the implement data logic
  methods: {
    addSong: function () {
      var value = this.newSong && this.newSong.trim()
      if (!value) {
        return
      }
      this.songs.push({
        id: songStorage.uid++,
        title: value,
        completed: false
      })
      this.newSong = ''
    },

    removeSong: function (song) {
      this.songs.splice(this.songs.indexOf(song), 1)
    },

    editSong: function (song) {
      this.beforeEditCache = song.title
      this.editedSong = song
    },

    doneEdit: function (song) {
      if (!this.editedSong) {
        return
      }
      this.editedSong = null
      if (!song.title) {
        this.removeSong(song)
      }
    },

    cancelEdit: function (song) {
      this.editedSong = null
      song.title = this.beforeEditCache
    },

    removeCompleted: function () {
      this.songs = filters.active(this.todos)
    }
  },

  directives: {
    'song-focus': function (el, binding) {
      if (binding.value) {
        el.focus()
      }
    }
  }
})

// handle routing
function onHashChange () {
  var visibility = window.location.hash.replace(/#\/?/, '')
  if (filters[visibility]) {
    app.visibility = visibility
  } else {
    window.location.hash = ''
    app.visibility = 'all'
  }
}

window.addEventListener('hashchange', onHashChange)
onHashChange()

// mount
app.$mount('.lyre')
