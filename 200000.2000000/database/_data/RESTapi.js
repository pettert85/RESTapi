//CURL -X (GET,POST,PUT;DELETE) http://bp:8888/(something) 
//https://expressjs.com/en/guide/routing.html
//http://www.sqlitetutorial.net/sqlite-nodejs/query/
//https://www.npmjs.com/package/xmlbuilder
//npm install express, sqlite3, xmlbuilder --save
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
var builder = require('xmlbuilder');
const app = express();
const port = 8888;
var node = require("deasync");
var bodyParser = require("body-parser");
require('body-parser-xml')(bodyParser); 
app.use(bodyParser.xml());
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
	xmlFile += '<!DOCTYPE note SYSTEM "http://bp/forfatter.dtd">'

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
	xmlFile += '<!DOCTYPE note SYSTEM "http://bp/forfatter.dtd">'
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
	xmlFile += '<!DOCTYPE note SYSTEM "http://bp/bok.dtd">'
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
	xmlFile += '<!DOCTYPE note SYSTEM "http://bp/bok.dtd">'
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

app.post('/login/',function (req,res) {
	var bruker = req.body.login.brukernavn[0];
	var pass = req.body.login.passord[0];

	let sql = `SELECT passordhash AS hash FROM bruker WHERE fornavn  = ?`;
 
// first row only
db.get(sql, ['bruker'], (err, row) => {
  if (err) {
    return console.error(err.message);
  }
  return row
    	? console.log(row.hash)
	: console.log('nei');
 });	


});



app.post('/forfatter/:forfatterId',function (req,res) {
	var FiD = req.body.forfatter.forfatterID[0];
	var fnavn = req.body.forfatter.fornavn[0];
	var enavn = req.body.forfatter.etternavn[0];
	var nat = req.body.forfatter.nasjonalitet[0];
	db.run('INSERT INTO forfatter VALUES (?,?,?,?)', [FiD, fnavn, enavn, nat], function(err){
		if (err){
    			res.send("UUUPS noe gikk galt!");
			return console.error(err.message);
		}
		res.send("Forfatter ble lagt til");
	});

});

app.put('/forfatter/:forfatterId',function (req,res) {
	var FiD = req.body.forfatter.forfatterID[0];
	var fnavn = req.body.forfatter.fornavn[0];
	var enavn = req.body.forfatter.etternavn[0];
	var nat = req.body.forfatter.nasjonalitet[0];
	let data = [fnavn, enavn, nat, FiD]
	let sql = `UPDATE forfatter
		   SET fornavn = ?, etternavn = ?, nasjonalitet = ?
		   WHERE forfatterID = ?`
	db.run(sql, data, function(err) {
  		if (err) {
    			res.send("UUUPS noe gikk galt!");
			return console.error(err.message);
  		}

		if (this.changes != 1){
			res.send("Forfatteren finnes ikke i databasen!");
			return;
		}
		else res.send("Forfatteren ble endret"); 
	});
});

app.delete('/forfatter/:forfatterId',function (req,res) {
	var FiD = req.body.forfatter.forfatterID[0];
	db.run('DELETE FROM forfatter WHERE (forfatterID = ?)', [FiD], function(err){
		if (err) {
    			res.send("UUUPS noe gikk galt!");
			return console.error(err.message);
  		}
		if (this.changes != 1){
			res.send("Noe gikk galt!");
		}
		res.send("Forfatteren ble slettet");
	});
});

app.post('/bok/:bokId', function (req,res) {
	var BiD = req.body.bok.bokID[0];
	var tittel = req.body.bok.tittel[0];
	var FiD = req.body.bok.forfatterID[0];

	db.run('INSERT INTO bok VALUES (?,?,?)', [BiD, tittel, FiD], function(err){
		if (err){
    			res.send("UUUPS noe gikk galt!");
			return console.error(err.message);
		}
		res.send("Boken ble lagt til");
	});

});

app.put('/bok/:bokId',function (req,res) {
	var BiD = req.body.bok.bokID[0];
	var tittel = req.body.bok.tittel[0];
	var FiD = req.body.bok.forfatterID[0];
	let data = [tittel, FiD, BiD]
	let sql = `UPDATE bok
		   SET tittel = ?, forfatterID = ?
		   WHERE bokID = ?`
	
	db.run(sql, data, function(err) {
  		if (err) {
    			res.send("UUUPS noe gikk galt!");
			return console.error(err.message);
  		}

		if (this.changes != 1){
			res.send("Boken finnes ikke i databasen!");
			return;
		}
		else res.send("Boken ble endret"); 
	});
});

app.delete('/bok/:bokId',function (req,res) {
	var BiD = req.body.bok.bokID[0];
	db.run('DELETE FROM bok WHERE (bokID = ?)', [BiD], function(err){
		if (err) {
    			res.send("UUUPS noe gikk galt!");
			return console.error(err.message);
  		}
		if (this.changes != 1){
			res.send("Noe gikk galt!");
		}
		res.send("Boken ble slettet");
	});
});

app.listen(port, () => console.log(`RESTapi listening on port ${port}!`))
