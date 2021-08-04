const ssm = require("./utils/ssm");
const db = require("./dbhandler/mysql_handler");
const mysql = require("mysql");
const AWS = require("aws-sdk");
const constants = require("./utils/constans");
AWS.config.update({ region: "us-east-1" });

exports.handler = async event => {
  const response = {
    statusCode: 200,
    body: JSON.stringify("Lambda Run Without Problems!!")
  };
  const ssmClient = new AWS.SSM({
    apiVersion: "2014-11-06",
    region: "us-east-1"
  });
  const ssmObject = new ssm.SSM(ssmClient);
  console.log("Creo el objeto de ssm");

  const data = await ssmObject.retrieveParameters(constants.PARAMETER_PATH);
  console.log("Parametros leidos", JSON.stringify(data));
  const connection = mysql.createConnection({
    host: data[constants.PARAMETER_NAME_DBHOST],
    user: data[constants.PARAMETER_NAME_USER],
    password: data[constants.PARAMETER_NAME_PASSWORD],
    database: data[constants.PARAMETER_NAME_DATABASE]
  });

  const dbObject = new db.MySqlHandler(connection);
  try {
    // TODO
    // const responseQuery = await dbObject.queryAllData(
    //   constants.TABLE_NAME_USER
    // );
    // response.body = JSON.stringify("Users table was read it");
    // response.data = responseQuery[0];
    const affectedRowsAuthors = await dbObject.deleteReferences(
      "posts_authors",
      "post_id",
      "posts",
      "id"
    );
    console.log("Post-Authors Deleted: ", affectedRowsAuthors);
    const affectedRowsMeta = await dbObject.deleteReferences(
      "posts_meta",
      "post_id",
      "posts",
      "id"
    );
    console.log("Post-Meta Deleted: ", affectedRowsMeta);
    const affectedRowsTags = await dbObject.deleteReferences(
      "posts_tags",
      "post_id",
      "posts",
      "id"
    );
    console.log("Post-Tags Deleted: ", affectedRowsTags);
    const affectedRows = await dbObject.deleteAllData(
      constants.TABLE_NAME_POST
    );
    response.body = JSON.stringify(
      `${affectedRows} records from post table were deleted`
    );
    response.data = [];
    return response;
  } catch (error) {
    response.body = JSON.stringify("There were an error quering data");
    response.err = error.message;
    connection.end(err => {
      console.log(err);
      response.body = JSON.stringify(
        "There were an error closing the connection"
      );
    });

    return response;
  }

  // TODO
  // TODO
  // let dbObject = new db.MySqlHandler(connection);
  // dbObject.deleteAllData(constants.TABLE_NAME_USER).then(data => {
  //     console.log(`${data.affectedRows} rows affected`);
  //     response.body = JSON.stringify("Post table was read it");
  //     response.affectedRows = JSON.stringify(data.affectedRows);
  // }).catch(err => {
  //     response.body = JSON.stringify("There were an error quering data");
  //     response.err = JSON.stringify(err);
  //     return response;
  // });;
};
