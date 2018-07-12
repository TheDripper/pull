
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
	return nospec(decodeURI(strip(url)));
}

app.set('port', port)

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

app.use('/',async function(req,res,next) {
	  //var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
	  if(req.url=='/') {
        	let { data } = await axios('http://food.berkeley.edu');
		let clean = [];
		let mime = ['.png','.jpg','.gif','.svg'];
		urls(data).forEach(url=>{
			let ext = path.extname(prep(url));
			if(mime.includes(ext))
				clean.push(nospec(decodeURI(strip(url))));
		});
		console.log(clean);
		clean.forEach(async url=>{
			let { data } = await axios.get(url,{responseType:"arraybuffer"});	
			let name = path.basename(url);
        		fs.writeFile('static/'+name,data,function(err){
        		        if(err)
        		      	  return console.log(err);
        		        console.log('writ');
        		});
		});
	  }
        next();
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
