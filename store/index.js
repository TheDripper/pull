import Vuex from 'vuex'

const createStore = () => {
  return new Vuex.Store({
    state: {
      styles: [],
      scripts: [],
      mark: ''
    },
    mutations: {
      loadStyles (state, styles) {
        state.styles = styles
      },
      loadScripts(state,scripts) {
        state.scripts = scripts;
      },
      mark(state,mark) {
	state.mark = mark;
      }
    },
    actions: {
	    async nuxtServerInit({ commit },context) {
		let axios = require('axios');    
		let getUrls = require('get-urls');
		let path = require('path');
		let sanitize = require('sanitize-filename');
		let strip = require('striptags');
		let cheerio = require('cheerio');
		console.log('AAO');
		console.log(context.params.page);
		let { data } = await axios.get('http://'+context.params.page);
		const $ = cheerio.load(data);

		const nospec = function(string) {
			return string.replace(/[<>'"();]/gi, '');
		}
		const prep = function(url) {
			return nospec(strip(decodeURI(url)));
		}
		const getFiles = async function(data,type) {
			//let { data } = await axios.get(url);
			let matches = data.match(/\bhttps?:\/\/\S+/gi);
			let clean = [];
			matches.forEach(url=>{
				url = prep(url).split('?')[0];
				let ext = path.extname(url);
				let imgMime = ['.jpg','.png','.gif','.svg'];
				if(type=='all'||type=='image'&&imgMime.includes(ext)||type=='script'&&ext=='.js')
					clean.push(prep(url));
			});
			return clean;
		}
		const fixPath = function(url) {
			let parsed = path.parse(url);
			return url.replace(parsed.dir+'/'+parsed.base,parsed.base);
		}

		$('html').find('script').each(function(){
			$(this).remove();
		});
		data = $('body').html();
		let matches = data.match(/\bhttps?:\/\/\S+/gi);
		let clean = await getFiles(data,'all');
		clean.forEach(async url=>{
			url = prep(url).split('?')[0];
			let ext = path.extname(url);
			let imgMime = ['.jpg','.png','.gif','.svg'];
			if(imgMime.includes(ext)) {
				let parsed = path.parse(url);
				data = data.replace(parsed.dir+'/'+parsed.base,'/'+parsed.base);
			} else if (ext=='.js') {
				let parsed = path.parse(url);
				data = data.replace(url,'');
			}
		});
		console.log(data);
		commit('mark',data);
	    }
    }
  })
}


export default createStore
