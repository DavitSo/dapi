const {
  v0: {
    GetAddressBalanceResponse,
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
 * @returns {getAddressBalanceHandler}
 */
function getAddressBalanceHandlerFactory(coreRPCClient) {
  /**
   * @typedef getAddressBalanceHandler
   * @param {Object} call
   * @return {Promise<GetAddressBalanceResponse>}
   */
  async function getAddressBalanceHandler(call) {
    const { request } = call;

    const addressArray = request.getItemsList();
    if (!addressArray || addressArray.length === 0) {
      throw new InvalidArgumentGrpcError('Address is not specified');
    }
    const address = addressArray[0].getAddressesList();
    if (!address || address.length === 0) {
      throw new InvalidArgumentGrpcError('Address is not specified');
    }

    let serializedBlock;
    try {
      serializedBlock = await coreRPCClient.getAddressBalance(addressArray);
    } catch (e) {
      if (e.code === -5) {
        throw new NotFoundGrpcError('Invalid address');
      }
      throw e;
    }

    const response = new GetAddressBalanceResponse();
    response.setBalance(serializedBlock.balance);
    response.setReceived(serializedBlock.received);

    return response;
  }

  return getAddressBalanceHandler;
}

module.exports = getAddressBalanceHandlerFactory;
