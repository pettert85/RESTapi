//CURL -X (GET,POST,PUT;DELETE) http://bp:8888/(something) 
//https://expressjs.com/en/guide/routing.html
//http://www.sqlitetutorial.net/sqlite-nodejs/query/
//https://www.npmjs.com/package/xmlbuilder
//npm install express, sqlite3, xmlbuilder --save
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cookieParser = require('cookie-parser');
var builder = require('xmlbuilder');
const app = express();
const port = 8888;
var node = require("deasync");
var bodyParser = require("body-parser");
require('body-parser-xml')(bodyParser); 
app.use(bodyParser.xml());
app.use(cookieParser());
node.loop = node.runLoopOnce;
let db = new sqlite3.Database('./database', sqlite3.OPEN_READWRITE, (err) => {
if (err){
	console.error(err.message);
}
console.log('DB connected');
});


//This enables CORS - Cross Origin Resource Sharing (for AJAX)
//which by default does not work!
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


app.get('/forfatter/',function (req,res) {
	console.log('request');
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
	var hash;

	let sql = `SELECT passordhash AS hash FROM bruker WHERE fornavn  = ?`;
	// first row only
	db.get(sql, [bruker], (err, row) => {
  	   if (err) {
  		return console.error(err.message);
	   }

	   else{
		hash = row.hash;

		//fjerne tomme linjer 
		hash = hash.trim();
		pass = pass.trim();

		if ( (pass.valueOf() == hash.valueOf()) ){
			//set sessionID og responder med cookie
			var sessionID = parseInt(Math.random() * (99999 - 11111) + 11111);
			db.run(`INSERT INTO sesjon VALUES (?, ?)`, [sessionID, bruker], function(err){
				if(err){
					console.log("Session ID not set!");
					return console.error(err.message);
				}
				console.log('Session ID:' + sessionID + ' er satt for: '+bruker);
			});
  		// Set cookie
    		res.append('Set-Cookie', 'FortuneCookie='+sessionID+'; Path=/; HttpOnly');
		res.send('Login var vellykket. Velkommen ' + bruker +'!');

		}
	  }
	});
});


app.post('/logout/',function (req,res){
	if(validSession(req.cookies.FortuneCookie)){
		var sessionID = req.body.logout.sessionID[0];
		db.run(`DELETE from sesjon where sessionID = ?`, [sessionID], function(err){

			if(err){
				console.log("Sesjonen ble ikke avsluttet!");
				return console.error(err.message);
			}
			else{
				console.log("Logget av");
				res.send("Logget av, velkommen igjen!");
			}
		});
	}
	else
		res.send("Du er ikke logget inn!");
});


app.post('/forfatter/:forfatterId',function (req,res) {
	if(validSession(req.cookies.FortuneCookie)){
		var FiD = req.body.forfatter.forfatterID[0];
		var fnavn = req.body.forfatter.fornavn[0];
		var enavn = req.body.forfatter.etternavn[0];
		var nat = req.body.forfatter.nasjonalitet[0];
		db.run('INSERT INTO forfatter VALUES (?,?,?,?)', [FiD, fnavn, enavn, nat], function(err){
			if (err){
    				res.send("forfatterID finnes allerede!");
				return console.error(err.message);
			}
			else{
				res.send("Forfatter ble lagt til");
				return;
			}
		});
	}
	else{
		res.send('Du må logge inn!');
	}
});

app.put('/forfatter/:forfatterId',function (req,res) {
	if(validSession(req.cookies.FortuneCookie)){
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
			else 
				res.send("Forfatteren ble endret"); 
		});
	}

	else{
		res.send('Du må logge inn!');
	}
});

app.delete('/forfatter/:forfatterId',function (req,res) {
	if(validSession(req.cookies.FortuneCookie)){
		var FiD = req.body.forfatter.forfatterID[0];
		db.run('DELETE FROM forfatter WHERE (forfatterID = ?)', [FiD], function(err){
			if (err) {
	    			res.send("UUUPS noe gikk galt!");
				return console.error(err.message);
	  		}
			if (this.changes != 1){
				res.send("Noe gikk galt!");
			}
			else
				res.send("Forfatteren ble slettet");
		});
	}

	else{
		res.send('Du må logge inn!');
	}
});


app.delete('/forfatter',function (req,res) {
	if(validSession(req.cookies.FortuneCookie)){
		db.run(`DELETE FROM forfatter`, function(err){
			if (err) {
	    			res.send("UUUPS noe gikk galt!");
				return console.error(err.message);
	  		}
			if (this.changes == 0){
				res.send("Tabellen er allerede tom");
			}
			else
				res.send("Alle forfattere ble slettet");
		});
	}

	else{
		res.send('Du må logge inn!');
	}
});


app.post('/bok/:bokId', function (req,res) {
	if(validSession(req.cookies.FortuneCookie)){
		var BiD = req.body.bok.bokID[0];
		var tittel = req.body.bok.tittel[0];
		var FiD = req.body.bok.forfatterID[0];

		db.run('INSERT INTO bok VALUES (?,?,?)', [BiD, tittel, FiD], function(err){
			if (err){
	    			res.send("UUUPS noe gikk galt!");
				return console.error(err.message);
			}
			else
				res.send("Boken ble lagt til");
		});
	}
	else{
		res.send('Du må logge inn!');
	}
});

app.put('/bok/:bokId',function (req,res) {
	if(validSession(req.cookies.FortuneCookie)){
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
			else 
				res.send("Boken ble endret"); 
		});
	}

	else{
		res.send('Du må logge inn!');
	}
});

app.delete('/bok/:bokId',function (req,res) {
	if(validSession(req.cookies.FortuneCookie)){
		var BiD = req.body.bok.bokID[0];
		db.run('DELETE FROM bok WHERE (bokID = ?)', [BiD], function(err){
			if (err) {
	    			res.send("UUUPS noe gikk galt!");
				return console.error(err.message);
	  		}
			if (this.changes != 1){
				res.send("Noe gikk galt!");
			}
			else
				res.send("Boken ble slettet");
		});
	}

	else{
		res.send('Du må logge inn!');
	}
});

app.delete('/bok',function (req,res) {
	if(validSession(req.cookies.FortuneCookie)){
		db.run('DELETE FROM bok', function(err){
			if (err) {
	    			res.send("UUUPS noe gikk galt!");
				return console.error(err.message);
	  		}
			if (this.changes == 0){
				res.send("Tabellen er allerede tom");
			}
			else
				res.send("Alle ble slettet");
		});
	}

	else{
		res.send('Du må logge inn!');
	}
});

//sjekker sessionID
function validSession(sessionID) {
	var x;
		db.get('SELECT sessionID as ID FROM sesjon WHERE sessionID= ?', [sessionID], (err, row) => {
  			if (err) {
    				return console.error(err.message);
  			}

			//console.log('Row.ID:' + row.ID + 'sessionID' + sessionID +"noe");
			if(row == undefined){
			console.log('ingen matchende sessionID i databasen');
			x = false;
			}

			else if(sessionID.localeCompare(row.ID) != 0 ) {
				console.log('sessionID matcher ikke')
				x=false;
			}

			else{

				console.log('session ID matcher')
				x = true;
			}
		});

		//syncronize shit before return
		while(x === undefined) {
    			require('deasync').sleep(100);
  		}

		return x;
}


app.listen(port, () => console.log(`RESTapi listening on port ${port}!`))
