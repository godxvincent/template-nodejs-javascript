const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });

process.env.PARAMETER_PATH = "/godxvincent/product/";

/**
 * Función que dinámicamente permite incluir varias pruebas unitarias
 * @param {*} name Descripción del escenario
 * @param {*} path Ruta del archivo que contiene los casos de prueba.
 */
function importTest(name, path) {
  describe(name, function() {
    require(path);
  });
}

describe("index main test", function() {
  before(function() {});
  beforeEach(function() {});

  importTest("TEST SSM COMPONENT", "./utils/ssm_test");
  importTest("TEST DBHANDLER COMPONENT", "./db_handler/mysql_handler_test");
  importTest("TEST MAIN/LAMBDA COMPONENT", "./handler/index_test");

  after(function() {});
});