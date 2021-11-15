const {
  v0: {
    GetAddressUTXOResponse,
    Utxo,
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
 * @returns {getAddressUTXOHandler}
 */
function getAddressUTXOHandlerFactory(coreRPCClient) {
  /**
   * @typedef getAddressUTXOHandler
   * @param {Object} call
   * @return {Promise<GetAddressUTXOResponse>}
   */
  async function getAddressUTXOHandler(call) {
    const { request } = call;

    const address = request.getAddress();
    if (!address || address.length === 0) {
      throw new InvalidArgumentGrpcError('Address is not specified');
    }
    let utxos;
    try {
      utxos = await coreRPCClient.getUTXO({ addresses: [address] });
    } catch (e) {
      if (e.code === -5) {
        throw new NotFoundGrpcError('Invalid address');
      }
      throw e;
    }
    const response = new GetAddressUTXOResponse();
    const temp = new Utxo();
    for (const utxo of utxos) {
      temp.setAddress(utxo.address);
      temp.setTransactionId(utxo.txid);
      temp.setOutputIndex(utxo.outputIndex);
      temp.setScript(utxo.script);
      temp.setSatoshis(utxo.satoshis);
      response.addUtxos(temp);
    }
    return response;
  }

  return getAddressUTXOHandler;
}

module.exports = getAddressUTXOHandlerFactory;
