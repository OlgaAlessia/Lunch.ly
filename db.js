/** Database for lunchly */

const pg = require("pg");

//"postgresql:///lunchly"
const db = new pg.Client({
  host: "/var/run/postgresql/",
  database: "lunchly",
});
db.connect();

module.exports = db;
