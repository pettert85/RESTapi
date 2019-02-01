// http://www.sqlitetutorial.net/sqlite-nodejs/connect/
// https://expressjs.com/en/starter/basic-routing.html
const sqlite3 = require('sqlite3').verbose();
 
// open the database
let db = new sqlite3.Database('./dbconfig', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});
 
//db.serialize(() => {
//  db.each(`SELECT name FROM bruker`, (err, row) => {
//    if (err) {
//      console.error(err.message);
//    }
//    console.log(row.id + "\t" + row.name);
//  });
//});
//

let sql = `SELECT fornavn FROM bruker`;
 
db.all(sql, [], (err, rows) => {
  if (err) {
    throw err;
  }
  rows.forEach((row) => {
    console.log(row.name);
  });
});
 
db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});
