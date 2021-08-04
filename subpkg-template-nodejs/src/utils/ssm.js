/** Class to handle operations on AWS Parameter Store Service */
class SSM {
  /**
   * Creates an object taking as a parameter a ssmClient
   * @param {Object} ssmClient
   */
  constructor(ssmClient) {
    this.ssmClient = ssmClient;
  }

  /**
   * Return all the parameter given a path.
   * @param {Object} pathParameters Path of parameters to retrieve
   * @return {array}
   */
  async retrieveParameters(pathParameters) {
    const params = {
      Path: pathParameters,
      WithDecryption: true,
      Recursive: true
    };

    const listParams = {};
    let hasNextToken = true;
    while (hasNextToken) {
      const response = await this.ssmClient
        .getParametersByPath(params)
        .promise();

      if (response.Parameters) {
        response.Parameters.forEach(item => {
          const name = item.Name.split("/").pop();
          listParams[name] = item.Value;
        });
        if (!response.NextToken) {
          hasNextToken = false;
        } else {
          params.NextToken = response.NextToken;
        }
      } else {
        hasNextToken = false;
      }
    }
    return listParams;
  }
}

module.exports = {
  SSM
};
