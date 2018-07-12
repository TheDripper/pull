export default function (context) {
	fs.writeFile('test.txt','test',(err)=>{
		if(err)
			return console.log(err);
		console.log('worked');
	});
	console.log(context);
}
