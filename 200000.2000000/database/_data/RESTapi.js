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
var statusMessage;
var status;

let db = new sqlite3.Database('./database', sqlite3.OPEN_READWRITE, (err) => {
if (err){
	console.error(err.message);
}
console.log('DB connected');
});


//This enables CORS - Cross Origin Resource Sharing (for AJAX)
//which by default does not work!

// also rememeber that client request must be set with : xhttp.withCredentials = true; 

var cors = require('cors');
var corsOptions = {
    origin: 'http://bp', // must be set to trusted domain(s)
    credentials:true,   
    'Access-Control-Allow-Credentials': true };
app.use(cors(corsOptions));


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
	res.set('Content-Type', 'text/xml');

	var Id = req.param('forfatterId');
	var done = 0;	
	var xmlFile = '<?xml version="1.0" encoding="UTF-8"?>';
		xmlFile += '<!DOCTYPE note SYSTEM "http://bp/forfatter.dtd">'
		xmlFile += '<forfatterliste>';

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
    var done = 0;	
    var xmlFile = '<?xml version="1.0" encoding="UTF-8"?>';
		xmlFile += '<!DOCTYPE note SYSTEM "http://bp/bok.dtd">'
    	xmlFile += '<bokliste>';
	

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
	status = "false";
	statusMessage = undefined;

	// first row only
	db.get(sql, [bruker], (err, row) => {
  	   if (err) {
  		console.error(err.message);
	   }

	   	if(row == undefined){
	   		statusMessage = "Feil brukernavn";
	   		console.log("Feil brukernavn");
	   		res.set('Content-Type', 'text/xml');
			
			var xmlFile = '<?xml version="1.0" encoding="UTF-8"?>';	
			xmlFile += '<response>';
			xmlFile += '<status>' + status + '</status>';
			xmlFile += '<message>' + statusMessage + '</message>';
			xmlFile += '</response>';
			res.send(xmlFile);
	   		return;
	   	}

	   	else{
			hash = row.hash;

			//fjerne tomme linjer 
			hash = hash.trim();
			pass = pass.trim();

			if ( (pass.valueOf() == hash.valueOf()) ){
				statusMessage="Logg inn vellykket"
				status = "true";
				//set sessionID og responder med cookie
				var sessionID = parseInt(Math.random() * (99999 - 11111) + 11111);
				db.run(`INSERT INTO sesjon VALUES (?, ?)`, [sessionID, bruker], function(err){
					if(err){
						statusMessage = "Noe gikk galt!";
						console.log("Session ID not set!");
						console.error(err.message);

					}

					console.log('Session ID:' + sessionID + ' er satt for: '+bruker);
				});
				
			res.append('Set-Cookie', 'FortuneCookie='+sessionID+'; Path=/; HttpOnly');
			}
			else{
				statusMessage = "Feil passord!";
			}			
		}
	});
	
	while(statusMessage === undefined) {
    	require('deasync').sleep(100);
  	}
 
	res.set('Content-Type', 'text/xml');
	var xmlFile = '<?xml version="1.0" encoding="UTF-8"?>';	
	xmlFile += '<response>';
	xmlFile += '<status>' + status + '</status>';
	xmlFile += '<message>' + statusMessage + '</message>';
	xmlFile += '</response>';
	res.send(xmlFile);
});


app.get('/logout/',function (req,res){

	if(validSession(req.cookies.FortuneCookie)){
		var sessionID = req.cookies.FortuneCookie;
		db.run(`DELETE from sesjon where sessionID = ?`, [sessionID], function(err){

			if(err){
				console.log("Sesjonen ble ikke avsluttet!");
				return console.error(err.message);
			}
			
			else{
				console.log("Logget av");
			}
		});
	}
	
	else{
		console.log("Ikke inlogget");
	}
	res.send();
});

app.post('/forfatter/:forfatterId',function (req,res) {
	if(validSession(req.cookies.FortuneCookie)){
		var FiD = req.body.forfatter.forfatterID[0];
		var fnavn = req.body.forfatter.fornavn[0];
		var enavn = req.body.forfatter.etternavn[0];
		var nat = req.body.forfatter.nasjonalitet[0];
		status = "false";
		statusMessage = undefined;
		
		db.run('INSERT INTO forfatter VALUES (?,?,?,?)', [FiD, fnavn, enavn, nat], function(err){
			if (err){
				statusMessage = "forfatterID finnes allerede!";
				console.error(err.message);
			}
			else{
				statusMessage = "Forfatter ble lagt til";
				status = "true";
				console.log("first" + status + ", " + statusMessage);
			}
		});

	}
	else{
		statusMessage = 'Du må logge inn!';
	}
	console.log("Foran: " + status + ", " + statusMessage);
	while(statusMessage === undefined) {
    			require('deasync').sleep(100);
  		}
  	console.log("etter" + status + ", " + statusMessage);
	res.set('Content-Type', 'text/xml');
	var xmlFile = '<?xml version="1.0" encoding="UTF-8"?>';	
	xmlFile += '<response>';
	xmlFile += '<status>' + status + '</status>';
	xmlFile += '<message>' + statusMessage + '</message>';
	xmlFile += '</response>';
	res.send(xmlFile);	
});

app.put('/forfatter/:forfatterId',function (req,res) {
	if(validSession(req.cookies.FortuneCookie)){
		var FiD = req.body.forfatter.forfatterID[0];
		var fnavn = req.body.forfatter.fornavn[0];
		var enavn = req.body.forfatter.etternavn[0];
		var nat = req.body.forfatter.nasjonalitet[0];
		let data = [fnavn, enavn, nat, FiD]
		status = "false";
		statusMessage = undefined;

		let sql = `UPDATE forfatter
			   SET fornavn = ?, etternavn = ?, nasjonalitet = ?
			   WHERE forfatterID = ?`;
		
		db.run(sql, data, function(err) {
	  		if (err) {
	    			statusMessage = "UUUPS noe gikk galt!";
				 	console.error(err.message);
	  		}

			if (this.changes != 1){
				statusMessage = "Forfatteren finnes ikke i databasen!";
			}
			else{ 
				status = "true";
				statusMessage = "Forfatteren ble endret"; 
			}
		});
	}

	else{
		statusMessage = 'Du må logge inn!';
	}
	
	while(statusMessage === undefined) {
    	require('deasync').sleep(100);
  	}

	res.set('Content-Type', 'text/xml');
	var xmlFile = '<?xml version="1.0" encoding="UTF-8"?>';	
	xmlFile += '<response>';
	xmlFile += '<status>' + status + '</status>';
	xmlFile += '<message>' + statusMessage + '</message>';
	xmlFile += '</response>';
	res.send(xmlFile);	
});

app.delete('/forfatter/:forfatterId',function (req,res) {
	if(validSession(req.cookies.FortuneCookie)){
		var FiD = req.body.forfatter.forfatterID[0];
		status = "false";
		statusMessage = undefined;
		
		db.run('DELETE FROM forfatter WHERE (forfatterID = ?)', [FiD], function(err){
			if (err) {
	    		statusMessage = "UUUPS noe gikk galt!";
				console.error(err.message);
	  		}

			if (this.changes != 1){
				statusMessage = "Forfatteren ble IKKE slettet!";
			}

			else{
				statusMessage = "Forfatteren ble slettet";
				status = "true";
			}
		});
	}

	else{
		statusMessage = 'Du må logge inn!';
	}
	
	while(statusMessage === undefined) {
    	require('deasync').sleep(100);
  	}
  	
	res.set('Content-Type', 'text/xml');
	var xmlFile = '<?xml version="1.0" encoding="UTF-8"?>';	
	xmlFile += '<response>';
	xmlFile += '<status>' + status + '</status>';
	xmlFile += '<message>' + statusMessage + '</message>';
	xmlFile += '</response>';
	res.send(xmlFile);
});


app.delete('/forfatter',function (req,res) {
	if(validSession(req.cookies.FortuneCookie)){
		status = "false";
		statusMessage = undefined;
		
		db.run(`DELETE FROM forfatter`, function(err){
			if (err) {
	    		statusMessage = "UUUPS noe gikk galt!";
				console.error(err.message);
	  		}
			
			if (this.changes == 0){
				statusMessage = "Tabellen er allerede tom";
			}
			
			else{
				statusMessage = "Alle forfattere ble slettet";
				status = "true";
			}
		});
	}

	else{
		statusMessage = 'Du må logge inn!';
	}

	while(statusMessage === undefined) {
    	require('deasync').sleep(100);
  	}

	res.set('Content-Type', 'text/xml');
	var xmlFile = '<?xml version="1.0" encoding="UTF-8"?>';	
	xmlFile += '<response>';
	xmlFile += '<status>' + status + '</status>';
	xmlFile += '<message>' + statusMessage + '</message>';
	xmlFile += '</response>';
	res.send(xmlFile);	
});


app.post('/bok/:bokId', function (req,res) {
	if(validSession(req.cookies.FortuneCookie)){
		var BiD = req.body.bok.bokID[0];
		var tittel = req.body.bok.tittel[0];
		var FiD = req.body.bok.forfatterID[0];
		status = "false";
		statusMessage = undefined;

		db.run('INSERT INTO bok VALUES (?,?,?)', [BiD, tittel, FiD], function(err){
			if (err){
	    		statusMessage = "BokId er allerede i bruk";
				console.error(err.message);
			}

			else{
				statusMessage = "Boken ble lagt til";
				status = "true";
			}
		});
	}
	
	else{
		statusMessage = 'Du må logge inn!';
	}

	while(statusMessage === undefined) {
    	require('deasync').sleep(100);
  	}

	res.set('Content-Type', 'text/xml');
	var xmlFile = '<?xml version="1.0" encoding="UTF-8"?>';	
	xmlFile += '<response>';
	xmlFile += '<status>' + status + '</status>';
	xmlFile += '<message>' + statusMessage + '</message>';
	xmlFile += '</response>';
	res.send(xmlFile);
	
});

app.put('/bok/:bokId',function (req,res) {
	if(validSession(req.cookies.FortuneCookie)){
		var BiD = req.body.bok.bokID[0];
		var tittel = req.body.bok.tittel[0];
		var FiD = req.body.bok.forfatterID[0];
		status = "false";
		statusMessage = undefined;

		let data = [tittel, FiD, BiD]
		let sql = `UPDATE bok
			   SET tittel = ?, forfatterID = ?
			   WHERE bokID = ?`
		
		db.run(sql, data, function(err) {
	  		if (err) {
	    		statusMessage = "UUUPS noe gikk galt!";
				console.error(err.message);
	  		}

			if (this.changes != 1){
				statusMessage = "Boken finnes ikke i databasen!";
				
			}
			else 
				statusMessage = "Boken ble endret";
				status = "true"; 
		});
	}

	else{
		statusMessage = 'Du må logge inn!';
	}

	while(statusMessage === undefined) {
    	require('deasync').sleep(100);
  	}
  	
  	console.log("etter" + status + ", " + statusMessage);
	res.set('Content-Type', 'text/xml');
	var xmlFile = '<?xml version="1.0" encoding="UTF-8"?>';	
	xmlFile += '<response>';
	xmlFile += '<status>' + status + '</status>';
	xmlFile += '<message>' + statusMessage + '</message>';
	xmlFile += '</response>';
	res.send(xmlFile);
});

app.delete('/bok/:bokId',function (req,res) {
	if(validSession(req.cookies.FortuneCookie)){
		var BiD = req.body.bok.bokID[0];
		status = "false";
		statusMessage = undefined;
		db.run('DELETE FROM bok WHERE (bokID = ?)', [BiD], function(err){
			
			if (err) {
	    		statusMessage = "UUUPS noe gikk galt!";
				console.error(err.message);
	  		}
			
			if (this.changes != 1){
				statusMessage = "Noe gikk galt!";
			}
			
			else
				statusMessage = "Boken ble slettet";
				status = "true";
		});
	}

	else{
		statusMessage = 'Du må logge inn!';
	}

	while(statusMessage === undefined) {
    	require('deasync').sleep(100);
	}

	res.set('Content-Type', 'text/xml');
	var xmlFile = '<?xml version="1.0" encoding="UTF-8"?>';	
	xmlFile += '<response>';
	xmlFile += '<status>' + status + '</status>';
	xmlFile += '<message>' + statusMessage + '</message>';
	xmlFile += '</response>';
	res.send(xmlFile);
});

app.delete('/bok',function (req,res) {
	if(validSession(req.cookies.FortuneCookie)){
		status = "false";
		statusMessage = undefined;

		db.run('DELETE FROM bok', function(err){
			if (err) {
	    		statusMessage = "UUUPS noe gikk galt!";
				console.error(err.message);
	  		}

			if (this.changes == 0){
				statusMessage = "Tabellen er allerede tom";
			}
			
			else
				statusMessage = "Alle ble slettet";
				status = "true";
		});
	}

	else{
		statusMessage = 'Du må logge inn!';
	}

	while(statusMessage === undefined) {
    	require('deasync').sleep(100);
	}

	res.set('Content-Type', 'text/xml');
	var xmlFile = '<?xml version="1.0" encoding="UTF-8"?>';	
	xmlFile += '<response>';
	xmlFile += '<status>' + status + '</status>';
	xmlFile += '<message>' + statusMessage + '</message>';
	xmlFile += '</response>';
	res.send(xmlFile);
});

//sjekker sessionID
function validSession(sessionID) {
	var x;
		db.get('SELECT sessionID as ID FROM sesjon WHERE sessionID= ?', [sessionID], (err, row) => {
  			if (err) {
    				return console.error(err.message);
  			}

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
