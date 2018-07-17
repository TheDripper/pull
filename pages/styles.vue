<template>
<h1>{{ $store.state.styles }}</h1>
</template>
<script>
let axios = require('axios');
export default {
	async fetch({ store, params }) {
		let { data } = await axios.get('http://localhost:3000/css');
		store.commit('loadStyles',data);
	}
}
</script>
