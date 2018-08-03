
const express = require('express')
const { Nuxt, Builder } = require('nuxt')
const app = express()
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const urls = require('get-urls');
const strip = require('striptags');
const nospec = function(string) {
	return string.replace(/[<>'"();]/gi, '');
}
const prep = function(url) {
	return nospec(strip(decodeURI(url)));
}

app.set('port', port)

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

app.use('/',function(req,res,next){
	console.log('rrr')
	next()
})

app.use('/scrapes/:page',async function(req,res,next) {
	console.log(req.params.page);
	if(path.extname(req.params.page)!='.js') {
        	let { data } = await axios('http://'+req.params.page);
		let clean = [];
		let mime = ['.png','.jpg','.gif','.svg','.css','.js'];
		urls(data).forEach(url=>{
			url = prep(url).split('?')[0].replace('https','http');
			let ext = path.extname(url);
			if(mime.includes(ext)) {
				clean.push(nospec(decodeURI(strip(url))));
			}
		});
		clean.forEach(async url=>{
			let ext = path.extname(url);
			try {
				let { data } = await axios.get(url,{responseType:"arraybuffer"});
				let name = path.basename(url);
				fs.writeFile('static/'+name,data,function(err){
        			        if(err)
        			      	  return log.write(err);
        			});
			} catch(err) {
			}
		});
		console.log('okay');
	}
        next();
})

app.use('/css',function(req,res,next){
	let css = [];
	let js = [];
	fs.readdirSync('./static/').forEach(file=>{
		ext = path.extname(file);
		if(ext=='.css')
			css.push('/'+file);
		else if(ext=='.js')
			js.push('/'+file);
	});
	let data = {
		css: css,
		js: js
	}
	res.send(JSON.stringify(data));
})

app.use('/urls',function(req,res,next){
	let urls = JSON.parse(fs.readFileSync('urls.txt','utf8'))
	res.send(urls);
})

app.use('/test',async function(req,res,next){
	let { data }  = await axios('http://localhost:3000/urls');
	res.send(data);
})

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  // Give nuxt middleware to express
  
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host)
  console.log('Server listening on http://' + host + ':' + port) // eslint-disable-line no-console
}
start()
