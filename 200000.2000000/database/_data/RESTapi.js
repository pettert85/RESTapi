//CURL -X (GET,POST,PUT;DELETE) http://bp:8888/(something) 
//https://expressjs.com/en/guide/routing.html
//http://www.sqlitetutorial.net/sqlite-nodejs/query/
//https://www.npmjs.com/package/xmlbuilder
//npm install express, sqlite3, xmlbuilder --save
const express = require('express')
const sqlite3 = require('sqlite3').verbose();
const builder = require('xmlbuilder');
const app = express()
const port = 8888
let db = new sqlite3.Database('./database', sqlite3.OPEN_READWRITE, (err) => {
if (err){
	console.error(err.message);
}
console.log('DB connected');
});

app.get('/forfatter/',function (req,res) {
	/*
	db.serialize(function() {
	let sql = 'SELECT fornavn as fornavn FROM forfatter';
	db.each(sql, (err, rows) => {
	if (err) {
    		throw err;
 	}
    	send(rows.fornavn);
  	});
	});
	*/
	var xml = builder.create('root').ele('forfatter','hei').end({pretty:true});

	let sql = `SELECT * FROM forfatter
           ORDER BY forfatterID`;
 	
	db.all(sql, [], (err, rows) => {
 	if (err) {
    		throw err;
  	}

  	rows.forEach((row) => {
	//xml.ele('forfatter',row.forfatterID)
	//forfatter.ele('fornavn',row.fornavn);
	//forfatter.ele('etternavn',row.etternavn);
    			
	//console.log(row.forfatterID,row.etternavn,row.fornavn,row.nasjonalitet);
  	});
	res.send(xml);
	});
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
