import Vuex from 'vuex'

const createStore = () => {
  return new Vuex.Store({
    state: {
      styles: [],
      scripts: []
    },
    mutations: {
      loadStyles (state, styles) {
        state.styles = styles
      },
      loadScripts(state,scripts) {
        state.scripts = scripts;
      }
    },
    actions: {
	    async nuxtServerInit({ commit },{ req }) {
	    }
    }
  })
}


export default createStore
