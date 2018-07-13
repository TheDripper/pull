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
		url = prep(url).split('?')[0].replace('https','http');
		let ext = path.extname(url);
		let imgMime = ['.jpg','.png','.gif','.svg'];
		if(type=='all'||type=='image'&&imgMime.includes(ext)||type=='script'&&ext=='.js')
			clean.push(prep(url));
	});
	return clean;
}
const fixPath = function(url) {
	let parsed = path.parse(url);
	return url.replace(parsed.dir+'/'+parsed.base,'/'+parsed.base);
}
export default {
	async asyncData({ params }) {
		let { data } = await axios.get('http://www.newomics.com');
		//let matches = data.match(/\bhttps?:\/\/\S+/gi);
		//let clean = [];
		//matches.forEach(match=>{
		//	clean.push(prep(match));
		//});
		//let imgMime = ['.jpg','.png','.gif','.svg'];
		let clean = await getFiles(data,'all');
		clean.forEach(async url=>{
			url = prep(url).split('?')[0].replace('https','http');
			let ext = path.extname(url);
			if(imgMime.includes(ext)) {
				let parsed = path.parse(url);
				data = data.replace(parsed.dir+'/'+parsed.base,parsed.base);
			}
		});

		return { data: data }
	},
	async head() {
		let { data } = await axios.get('http://www.newomics.com');
		let clean = await getFiles(data,'script');
		let scripts = [];
		clean.forEach(url=>{
			url = fixPath(url);
			scripts.push({src: url});
		});
		console.log(scripts);
		return {
			script: scripts
		}
	}
}
</script>
