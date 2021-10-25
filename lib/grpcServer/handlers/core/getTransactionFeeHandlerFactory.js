const {
  v0: {
    GetTransactionFeeResponse,
  },
} = require('dapi-grpc');

const {
  server: {
    error: {
      InvalidArgumentGrpcError,
      NotFoundGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

/**
 * @param {CoreRpcClient} coreRPCClient
 * @returns {getTransactionFeeHandler}
 */
function getTransactionFeeHandlerFactory(coreRPCClient) {
  /**
   * @typedef getTransactionFeeHandler
   * @param {Object} call
   * @return {Promise<GetTransactionFeeResponse>}
   */
  async function getTransactionFeeHandler(call) {
    const { request } = call;

    let serializedBlock;
    try {
      serializedBlock = await coreRPCClient.getTransactionFee(request.getAddress(),
        request.getAmount());
    } catch (e) {
      if (e.code === -5) {
        throw new NotFoundGrpcError('Invalid HellenicCoin address');
      } else if (e.code === -2) {
        throw new InvalidArgumentGrpcError('Invalid amount for send');
      }
      throw e;
    }
    const response = new GetTransactionFeeResponse();
    response.setFee(serializedBlock);
    return response;
  }
  return getTransactionFeeHandler;
}

module.exports = getTransactionFeeHandlerFactory;
