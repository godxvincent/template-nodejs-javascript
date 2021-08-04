/** Class MySqlHandler for handle a mysql connection */
class MySqlHandler {
  /**
   * Create an object that handle queries to mysql
   * @param {object} connection
   */
  constructor(connection) {
    this.connection = connection;
  }

  /**
   * Retrieve all data from a table
   * @param {string} tableName
   * @return {promise}
   */
  queryAllData(tableName) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM ${tableName};`;
      this.connection.query(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          console.log("Data received from Db:\n");
          console.log(rows);
          resolve(rows);
        }
      });
    });
  }

  /**
   * Delete all data from a table
   * @param {string} tableName
   * @return {promise}
   */
  deleteAllData(tableName) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM ${tableName};`;
      this.connection.query(query, (err, result) => {
        if (err) {
          reject(err);
        } else {
          console.log(`Deleted ${result.affectedRows} row(s)`);
          resolve(result.affectedRows);
        }
      });
    });
  }

  /**
   * Delete all data from a table
   * @param {string} tableName
   * @param {string} idJoin
   * @param {string} subtable
   * @param {string} idField
   * @return {promise}
   */
  deleteReferences(tableName, idJoin, subtable, idField) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM ${tableName} WHERE ${idJoin} IN (SELECT ${idField} FROM ${subtable});`;
      this.connection.query(query, (err, result) => {
        if (err) {
          reject(err);
        } else {
          console.log(`Deleted ${result.affectedRows} row(s)`);
          resolve(result.affectedRows);
        }
      });
    });
  }

  /**
   * Close de connection.
   * @return {promise}
   */
  closeConnection() {
    return new Promise((resolve, reject) => {
      this.connection.end(err => {
        if (err) reject(err);
        resolve();
      });
    });
  }
}

module.exports = {
  MySqlHandler
};
