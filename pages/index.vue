<template>
<div v-html="data">
</div>
</template>
<script>
let axios = require('axios');
let getUrls = require('get-urls');
let path = require('path');
let sanitize = require('sanitize-filename');
let strip = require('striptags');
let cheerio = require('cheerio');
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
export default {
	async asyncData({ params }) {
		let { data } = await axios.get('http://newomics.staging.wpengine.com');
		const $ = cheerio.load(data);
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
				data = data.replace(parsed.dir+'/'+parsed.base,parsed.base);
			} else if (ext=='.js') {
				let parsed = path.parse(url);
				data = data.replace(url,'');
			}
		});

		return { data: data }
	},
	head() {
		let styles = this.$store.state.styles;
		let jsFiles = this.$store.state.scripts;
		let links = [];
		let scripts = [];
		styles.forEach(style=>{
			var sheet = {
				rel: 'stylesheet',
				href: style
			}
			links.push(sheet);
		});
		jsFiles.forEach(file=>{
			var js = {
				src: file
			}
			scripts.push(js);
		});
		return {
			script: scripts,
			link: links
		}
	},
	async fetch({ store, params }) {
		let { data } = await axios.get('http://localhost:3000/css');
		store.commit('loadStyles',data.css);
		store.commit('loadScripts',data.js);
	}
}
</script>
