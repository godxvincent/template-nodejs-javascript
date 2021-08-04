const assert = require("assert");
const ssm = require("../../src/utils/ssm");
const AWSMock = require("aws-sdk-mock");
const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
const constants = require("../../src/utils/constans");

const response = {
  Parameters: [
    {
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

describe("Retrieve Parameters By Path", function() {
  before(function() {});

  it("Case 1 - Happy Path", function(done) {
    AWSMock.mock("SSM", "getParametersByPath", function(params, callback) {
      if (params.Path === constants.PARAMETER_PATH) {
        callback(null, response);
      } else {
        callback("Error de parametros", null);
      }
    });
    AWSMock.setSDKInstance(AWS);
    const ssmClient = new AWS.SSM({
      apiVersion: "2014-11-06",
      region: "us-east-1"
    });
    const ssmObject = new ssm.SSM(ssmClient);
    ssmObject
      .retrieveParameters(constants.PARAMETER_PATH)
      .then(data => {
        console.log(data);
        assert.strictEqual(data.ADMINUSER, "usertest", "Error!!!");
        done();
      })
      .catch(err => console.log(err));

    AWSMock.restore();
  });

  it("Case 2 - Fail Path", function(done) {
    AWSMock.mock("SSM", "getParametersByPath", function(params, callback) {
      console.log(params);
      if (params.Path === "/path/notexists") {
        callback(null, response);
      } else {
        callback("Error de parametros", null);
      }
    });
    AWSMock.setSDKInstance(AWS);
    const ssmClient = new AWS.SSM({
      apiVersion: "2014-11-06",
      region: "us-east-1"
    });
    const ssmObject = new ssm.SSM(ssmClient);
    console.log("response antes de la prueba", response);
    assert.rejects(
      ssmObject.retrieveParameters(constants.PARAMETER_PATH),
      "Function should fail"
    );
    done();
    AWSMock.restore();
  });

  it("Case 3 - Happy Path 2 - Where no response", function(done) {
    const response2 = {};
    AWSMock.mock("SSM", "getParametersByPath", function(params, callback) {
      console.log(params);
      if (params.Path === constants.PARAMETER_PATH) {
        callback(null, response2);
      } else {
        callback("Error de parametros", null);
      }
    });
    AWSMock.setSDKInstance(AWS);
    const ssmClient = new AWS.SSM({
      apiVersion: "2014-11-06",
      region: "us-east-1"
    });
    const ssmObject = new ssm.SSM(ssmClient);
    console.log("response antes de la prueba", response);
    assert.rejects(
      ssmObject.retrieveParameters(constants.PARAMETER_PATH),
      "Function should fail"
    );
    done();
    AWSMock.restore();
  });

  // it("Case 4 - Happy Path 2 - With Response but not NextToken", function(done) {
  //     const response2 = {
  //         Parameters: response.Parameters,
  //         NextToken: "eyJOZXh0VG9rZW4iOiBudWxsLCAiYm90b190cnVuY2F0ZV9hbW91bnQiOiAyfQ=="
  //     };
  //     AWSMock.mock("SSM", 'getParametersByPath', function(params, callback) {
  //         console.log(params);
  //         if (params.Path === constants.PARAMETER_PATH) {
  //             if (params.NextToken) {
  //                 response2.Parameters = [{
  //                     Name: constants.PARAMETER_PATH + "NUEVO_PARAMETRO",
  //                     Value: "NUEVO_VALOR"
  //                 }];
  //                 response2.NextToken = "";
  //                 callback(null, response2);
  //             } else {
  //                 callback(null, response2);
  //             }
  //         } else {
  //             callback("Error de parametros", null);
  //         }
  //     });
  //     AWSMock.setSDKInstance(AWS);
  //     const ssmClient = new AWS.SSM({ apiVersion: '2014-11-06', region: "us-east-1" });
  //     let ssmObject = new ssm.SSM(ssmClient);
  //     console.log("response antes de la prueba", response);
  //     ssmObject.retrieveParameters(constants.PARAMETER_PATH).then(data => {
  //         assert.strictEqual(data.Parameters.NUEVO_PARAMETRO, NUEVO_VALOR);
  //         done();
  //     }).catch(err => {
  //         console.log(err);
  //         done();
  //     });
  //     AWSMock.restore();

  // });
});
