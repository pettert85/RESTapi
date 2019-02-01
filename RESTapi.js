//CURL -X (GET,POST,PUT;DELETE) http://bp:8888/(something) 
//https://expressjs.com/en/guide/routing.html
//
//npm install express, sqlite3, xml --save
const express = require('express')
const app = express()
const port = 8888

app.get('/forfatter/',function (req,res) {
	res.send('alle forfattere' )
	
});

app.get('/forfatter/01',function (req,res) {
	res.send('forfatter 01' )
	
});


app.post('/',function (req,res) {
	res.send('Got a post request')
});

app.put('/',function (req,res) {
	res.send('Got a put request(update)')
});

app.delete('/',function (req,res) {
	res.send('Delete received')
});

app.listen(port, () => console.log(`RESTapi listening on port ${port}!`))
