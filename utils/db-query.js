const pool = require("./db-connection");

/**
 * @description this function will find data in a table using id match
 * @param  table table naem where need to search
 * @param  schema  provide which scema will related to table
 * @param  id  id for search
 * @returns single object from table
 */
async function findInTableById(table,schema, id) {

  const query = `SELECT * FROM ${schema}."${table}" WHERE id = $1;`; // table name injected
  const result = await pool.query(query, [id]);
  return result.rows[0];
}


module.exports = {findInTableById}
