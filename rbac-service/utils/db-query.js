const pool = require("./db-connection");

/**
 * @description this function will find data in a table using id match
 * @param  table table naem where need to search
 * @param  schema  provide which scema will related to table
 * @param  id  id for search
 * @returns single object from table or empty object
 */
async function findInTableById(table,schema, id) {

  const query = `SELECT * FROM ${schema}."${table}" WHERE id = $1 AND active=$2;`; // table name injected
  const result = await pool.query(query, [id,true]);
  if(result.rows.length === 0) return {}
  return result.rows[0];
}


module.exports = {findInTableById}
