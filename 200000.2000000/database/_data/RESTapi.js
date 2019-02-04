//CURL -X (GET,POST,PUT;DELETE) http://bp:8888/(something) 
//https://expressjs.com/en/guide/routing.html
//http://www.sqlitetutorial.net/sqlite-nodejs/query/
//https://www.npmjs.com/package/xmlbuilder
//npm install express, sqlite3, xmlbuilder --save
const express = require('express')
const sqlite3 = require('sqlite3').verbose();
var builder = require('xmlbuilder');
const app = express()
const port = 8888
var node = require("deasync");
node.loop = node.runLoopOnce;
let db = new sqlite3.Database('./database', sqlite3.OPEN_READWRITE, (err) => {
if (err){
	console.error(err.message);
}
console.log('DB connected');
});

app.get('/forfatter/',function (req,res) {
	res.set('Content-Type', 'text/xml');
    	var xmlFile = '<?xml version="1.0" encoding="UTF-8"?>';
	xmlFile = '<!DOCTYPE note SYSTEM "http://bp/forfatter.dtd">'

    	xmlFile += '<forfatterliste>';
	var done = 0;	

	let sql = `SELECT * FROM forfatter
           ORDER BY forfatterID`;
 	
	db.serialize(function() {
		db.all(sql, [], (err, rows) => {
 			if (err) {
    				throw err;
  			}
	
			var xml = builder.create('forfatterliste');
  			rows.forEach((row) => {
				xmlFile += '<forfatter>';
              			xmlFile += '<forfatterid>' + row.forfatterID + '</forfatterid>';
                		xmlFile += '<fornavn>' + row.fornavn + '</fornavn>';
                		xmlFile += '<etternavn>' + row.etternavn + '</etternavn>';
                		xmlFile += '<nasjonalitet>' + row.nasjonalitet + '</nasjonalitet>'
                		xmlFile += '</forfatter>';
           		 });		
		done = 1;
		});
		while(!done) {
        		node.loop();
        	}

        	xmlFile += '</forfatterliste>';
        	res.send(xmlFile);
	});
});

app.get('/forfatter/:forfatterId',function (req,res) {
	var Id = req.param('forfatterId');
	console.log('ForfatterID: ' + Id);
	res.set('Content-Type', 'text/xml');
    	var xmlFile = '<?xml version="1.0" encoding="UTF-8"?>';
    	xmlFile += '<forfatterliste>';
	var done = 0;	

	let sql = `SELECT * FROM forfatter WHERE forfatterID=?
           ORDER BY forfatterID`;
 	
	db.serialize(function() {
		db.all(sql, [Id], (err, rows) => {
 			if (err) {
    				throw err;
  			}
	
			var xml = builder.create('forfatterliste');
  			rows.forEach((row) => {
				xmlFile += '<forfatter>';
              			xmlFile += '<forfatterid>' + row.forfatterID + '</forfatterid>';
                		xmlFile += '<fornavn>' + row.fornavn + '</fornavn>';
                		xmlFile += '<etternavn>' + row.etternavn + '</etternavn>';
                		xmlFile += '<nasjonalitet>' + row.nasjonalitet + '</nasjonalitet>'
                		xmlFile += '</forfatter>';
           		 });		
		done = 1;
		});
		while(!done) {
        		node.loop();
        	}

        	xmlFile += '</forfatterliste>';
        	res.send(xmlFile);

		});
});


app.get('/bok/',function (req,res) {
	res.set('Content-Type', 'text/xml');
    	var xmlFile = '<?xml version="1.0" encoding="UTF-8"?>';
    	xmlFile += '<bokliste>';
	var done = 0;	

	let sql = `SELECT * FROM bok ORDER BY bokID`;
 	
	db.serialize(function() {
		db.all(sql, [], (err, rows) => {
 			if (err) {
    				throw err;
  			}
	
			var xml = builder.create('forfatterliste');
  			rows.forEach((row) => {
				xmlFile += '<bok>';
              			xmlFile += '<bokid>' + row.bokID + '</bokid>';
                		xmlFile += '<tittel>' + row.tittel + '</tittel>';
                		xmlFile += '<forfatterid>' + row.forfatterID + '</forfatterid>';
                		xmlFile += '</bok>';
           		 });		
		done = 1;
		});
		while(!done) {
        		node.loop();
        	}

        	xmlFile += '</bokliste>';
        	res.send(xmlFile);
	});
});

app.get('/bok/:bokId',function (req,res) {
	var Id = req.param('bokId');
	console.log('Bok id: ' + Id);
	res.set('Content-Type', 'text/xml');
    	var xmlFile = '<?xml version="1.0" encoding="UTF-8"?>';
    	xmlFile += '<bokliste>';
	var done = 0;	

	let sql = `SELECT * FROM bok WHERE bokID=? ORDER BY bokID`;
 	
	db.serialize(function() {
		db.all(sql, [Id], (err, rows) => {
 			if (err) {
    				throw err;
  			}
	
			var xml = builder.create('bokliste');
  			rows.forEach((row) => {
				xmlFile += '<bok>';
              			xmlFile += '<bokid>' + row.bokID + '</bokid>';
                		xmlFile += '<tittel>' + row.tittel + '</tittel>';
                		xmlFile += '<forfatterid>' + row.forfatterID + '</forfatterid>';
                		xmlFile += '</bok>';
           		 });		
		done = 1;
		});
		while(!done) {
        		node.loop();
        	}

        	xmlFile += '</bokliste>';
        	res.send(xmlFile);

		});
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
