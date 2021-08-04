const assert = require("assert");
const db = require("../../src/dbhandler/mysql_handler");
const sinon = require("sinon");
const Mysql = require("mysql");

let mysqlConnection;
let mysqlFunctionMocked;
let db_object;

describe("DataBase Handler", function() {
  beforeEach(function() {
    mysqlConnection = Mysql.createConnection({ host: "localhost" });
    mysqlFunctionMocked = sinon.mock(mysqlConnection);
    db_object = new db.MySqlHandler(mysqlConnection);
  });

  it("Case 1 - Happy Path - Query Data", function(done) {
    const name = "john doe";
    const results = [{ id: 0, name: name }];
    // Se especifica el methodo a mockear en expects.
    const expectation = mysqlFunctionMocked
      .expects("query")
      // Se dice conque parametros se va a llamar el metodo
      .withArgs("SELECT * FROM users;")
      // Si el metodo tiene un callback se debe especificar en que posicion de los argumentos (para el caso 1)
      // y los valores que se quieren de respuesta
      .callsArgWith(1, null, results);
    db_object.queryAllData("users").then(data => {
      assert.strictEqual(data[0].name, name);
      done();
    });
  });

  it("Case 2 - Fail Path - Query Data", function(done) {
    const name = "john doe";
    const results = [{ id: 0, name: name }];
    const fields = ["id", "name"];
    // Se especifica el methodo a mockear en expects.
    const expectation = mysqlFunctionMocked
      .expects("query")
      // Se dice conque parametros se va a llamar el metodo
      .withArgs("SELECT * FROM users;")
      // Si el metodo tiene un callback se debe especificar en que posicion de los argumentos (para el caso 1)
      // y los valores que se quieren de respuesta
      .callsArgWith(1, new Error("Error mockeado"), null);
    assert.rejects(db_object.queryAllData("users"));
    done();
  });

  it("Case 3 - Happy Path - Delete Data", function(done) {
    const results = { affectedRows: 1 };
    // Se especifica el methodo a mockear en expects.
    mysqlFunctionMocked
      .expects("query")
      // Se dice conque parametros se va a llamar el metodo
      .withArgs("DELETE FROM posts;")
      // Si el metodo tiene un callback se debe especificar en que posicion de los argumentos (para el caso 1)
      // y los valores que se quieren de respuesta
      .callsArgWith(1, null, results);
    db_object.deleteAllData("posts").then(data => {
      assert.strictEqual(data, 1);
      done();
    });
  });

  it("Case 4 - Fail Path - Delete Data", function(done) {
    // Se especifica el methodo a mockear en expects.
    mysqlFunctionMocked
      .expects("query")
      // Se dice conque parametros se va a llamar el metodo
      .withArgs("DELETE FROM posts;")
      // Si el metodo tiene un callback se debe especificar en que posicion de los argumentos (para el caso 1)
      // y los valores que se quieren de respuesta
      .callsArgWith(1, new Error("There was an error"), null);
    assert.rejects(db_object.deleteAllData("posts"));
    done();
  });

  it("Case 5 - Happy Path - Closing Connection Data", function(done) {
    // Se especifica el methodo a mockear en expects.
    mysqlFunctionMocked
      .expects("end")
      // Se dice conque parametros se va a llamar el metodo
      // .withArgs('DELETE FROM posts;')
      // Si el metodo tiene un callback se debe especificar en que posicion de los argumentos (para el caso 1)
      // y los valores que se quieren de respuesta
      .callsArgWith(0, new Error("There was an error closing connection"));
    assert.rejects(db_object.closeConnection());
    done();
  });

  it("Case 6 - Fail Path - Closing Connection Data", function(done) {
    // Se especifica el methodo a mockear en expects.
    mysqlFunctionMocked
      .expects("end")
      // Si el metodo tiene un callback se debe especificar en que posicion de los argumentos que recibe la funcion
      // esta el callback luego se especifican los valores con los que se llamará y la de respuesta
      .callsArgWith(0, null);
    db_object.closeConnection().then(() => {
      done();
    });
  });

  it("Case 7 - Happy Path - Delete References", function(done) {
    const results = { affectedRows: 1 };
    // Se especifica el methodo a mockear en expects.
    mysqlFunctionMocked
      .expects("query")
      // Se dice conque parametros se va a llamar el metodo
      .withArgs("DELETE FROM posts_authors WHERE post_id IN (SELECT id FROM posts);")
      // Si el metodo tiene un callback se debe especificar en que posicion de los argumentos (para el caso 1)
      // y los valores que se quieren de respuesta
      .callsArgWith(1, null, results);
    db_object.deleteReferences("posts_authors", "post_id", "posts", "id").then(data => {
      assert.strictEqual(data, 1);
      done();
    });
  });

  it("Case 8 - Fail Path - Delete References", function(done) {
    // Se especifica el methodo a mockear en expects.
    mysqlFunctionMocked
      .expects("query")
      // Se dice conque parametros se va a llamar el metodo
      .withArgs("DELETE FROM posts_authors WHERE post_id IN (SELECT id FROM posts);")
      // Si el metodo tiene un callback se debe especificar en que posicion de los argumentos (para el caso 1)
      // y los valores que se quieren de respuesta
      .callsArgWith(1, new Error("There was an error"), null);
    assert.rejects(db_object.deleteReferences("posts_authors", "post_id", "posts", "id"));
    done();
  });

  afterEach(function() {
    mysqlFunctionMocked.restore();
  });
});