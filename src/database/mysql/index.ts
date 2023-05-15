import mysql from 'mysql2';


const { host, user, password, dataBase } = process.env
const con = mysql.createConnection({
  host: host,
  user: user,
  password: password,
  database: dataBase,
});

export const initMySql = () => {
  con.connect(function (err: any) {
    if (err) console.log('[Mysql] Connection error ', err);
    else
      console.log("[Mysql] Connection established!");
  });
  con.end();
};