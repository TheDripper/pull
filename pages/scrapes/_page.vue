<template>
<div v-html="data">
</div>
</template>
<script>
export default {
	asyncData(context) {
		let data = context.store.state.mark
		return { data : data }
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
		let axios = require('axios');
		try {
			let { data } = await axios.get('http://localhost:3000/css');
			console.log(data.css);
			console.log(data.js);
			store.commit('loadStyles',data.css);
			store.commit('loadScripts',data.js);
		} catch(err) {
			console.log(err)
		}
	}
}
</script>
