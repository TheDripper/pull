<template>
<div v-html="data">
</div>
</template>
<script>
let axios = require('axios');
let getUrls = require('get-urls');
let cheerio = require('cheerio');
let path = require('path');
let sanitize = require('sanitize-filename');
let striptags = require('striptags');
let strip = function(string) {
	return string.replace(/[<>'"();]/gi, '');
}
export default {
	async asyncData({ params }) {
		let { data } = await axios.get('https://food.berkeley.edu');
		const $ = cheerio.load(data);
		let body = $('body').html();
		let matches = body.match(/\bhttps?:\/\/\S+/gi);
		let clean = [];
		matches.forEach(match=>{
			clean.push(strip(striptags(match)));
		});
		let imgMime = ['.jpg','.png','.gif','.svg'];
		clean.forEach(async url=>{
			let ext = path.extname(url);
			if(imgMime.includes(ext)) {
				let parsed = path.parse(url);
				console.log(url);
				body = body.replace(parsed.dir+'/'+parsed.base,parsed.base);
			}
		});

		//let urls = getUrls(data);
		//let clean = [];
		//urls.forEach(url=>{
		//		clean.push(decodeURI(url));
		//});
		//console.log(clean);
		
		return { data: body }
	}
}
</script>
