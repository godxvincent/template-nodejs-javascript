const assert = require("assert");
const lambda = require("../../src/index");
const AWSMock = require("aws-sdk-mock");
const AWS = require("aws-sdk");
const constants = require("../../src/utils/constans");
const sinon = require("sinon");

const response = {
  Parameters: [{
      Name: constants.PARAMETER_PATH + "PROTO",
      Value: "jdbc"
    },
    {
      Name: constants.PARAMETER_PATH + "ENDPOINT",
      Value: "localhost"
    },
    {
      Name: constants.PARAMETER_PATH + "DBNAME",
      Value: "test"
    },
    {
      Name: constants.PARAMETER_PATH + "ADMINUSER",
      Value: "usertest"
    },
    {
      Name: constants.PARAMETER_PATH + "PASS",
      Value: "passtest"
    }
  ]
};
const row = { id: 0, name: "john doe" };
const successConnectionObject = {
  connect: function(cb) {
    cb();
  },
  query: function(sqlQury, cb) {
    if (sqlQury === "SELECT * FROM users;") {
      cb(null, [row]);
    } else {
      if (sqlQury === "DELETE FROM posts;") {
        cb(null, { affectedRows: 100 });
      } else {
        cb(null, "");
      }
    }
  },
  end: function() {}
};

const successConnectionObjectNoData = {
  connect: function(cb) {
    cb();
  },
  query: function(sqlQury, cb) {
    if (sqlQury === "SELECT * FROM users;") {
      cb(null, [row]);
    } else {
      if (sqlQury === "DELETE FROM posts;") {
        cb(new Error("Error no data"), null);
      } else {
        cb(null, "");
      }
    }
  },
  end: function(cberr) {}
};

const successConnectionObjectErrorClose = {
  connect: function(cb) {
    cb();
  },
  query: function(sqlQury, cb) {
    if (sqlQury === "SELECT * FROM users;") {
      cb(null, [row]);
    } else {
      if (sqlQury === "DELETE FROM posts;") {
        cb(new Error("Error no data"), null);
      } else {
        cb(null, "");
      }
    }
  },
  end: function(cberr) {
    cberr("null");
  }
};

describe("Testing Handler", function() {
  it("Case 1 - Happy Path", function(done) {
    // Mock for aws
    AWSMock.mock("SSM", "getParametersByPath", function(params, callback) {
      if (params.Path === constants.PARAMETER_PATH) {
        callback(null, response);
      } else {
        callback("Error de parametros", null);
      }
    });
    AWSMock.setSDKInstance(AWS);

    // Mock for mysql
    const mySqlstub = sinon.stub(require("mysql"), "createConnection");
    mySqlstub.returns(successConnectionObject);

    lambda.handler().then(data => {
      // assert.strictEqual(data.data.name, row.name, "It couldn't delete any data");
      console.log(data);
      assert.strictEqual(JSON.parse(data.body), "100 records from post table were deleted", "It couldn't delete any data");
      mySqlstub.restore();
      done();
    });
  });

  it("Case 2 - Fail Path - No Data", function(done) {
    // Mock for aws
    AWSMock.mock("SSM", "getParametersByPath", function(params, callback) {
      if (params.Path === constants.PARAMETER_PATH) {
        callback(null, response);
      } else {
        callback("Error de parametros", null);
      }
    });
    AWSMock.setSDKInstance(AWS);

    // Mock for mysql
    const mySqlstub = sinon.stub(require("mysql"), "createConnection");
    mySqlstub.returns(successConnectionObjectNoData);

    // assert.rejects(lambda.handler());
    lambda.handler().then(data => {
      assert.strictEqual(data.err, "Error no data");
      mySqlstub.restore();
      done();
    });
  });

  it("Case 3 - Happy Path - Close Connection", function(done) {
    // Mock for aws
    AWSMock.mock("SSM", "getParametersByPath", function(params, callback) {
      if (params.Path === constants.PARAMETER_PATH) {
        callback(null, response);
      } else {
        callback("Error de parametros", null);
      }
    });
    AWSMock.setSDKInstance(AWS);

    // Mock for mysql
    const mySqlstub = sinon.stub(require("mysql"), "createConnection");
    mySqlstub.returns(successConnectionObjectErrorClose);

    // assert.rejects(lambda.handler());
    lambda
      .handler()
      .then(data => {
        console.log(data);
        assert.strictEqual(JSON.parse(data.body), "There were an error closing the connection");
        mySqlstub.restore();
        done();
      });
  });

  afterEach(function() {
    AWSMock.restore();
  });
});