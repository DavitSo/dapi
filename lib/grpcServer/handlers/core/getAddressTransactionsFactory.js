const {
  v0: {
    TransactionDetail,
    GetAddressTransactionsResponse,
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

const moment = require('moment');
/**
 * @param {CoreRpcClient} coreRPCClient
 * @returns {getAddressTransactionsHandler}
 */
function getAddressTransactionsHandlerFactory(coreRPCClient) {
  /**
   * @typedef getAddressTransactionsHandler
   * @param {Object} call
   * @returns {Promise<GetAddressTransactionsResponse>}
   */
  async function getAddressTransactionsHandler(call) {
    const { request } = call;

    const address = request.getAddress();

    if (!address || address.length === 0) {
      throw new InvalidArgumentGrpcError('Invalid address provided. Must be not empty');
    }

    let transactionDetails = [];
    try {
      const transactionIds = await coreRPCClient.getAddressTransactionsIds({ addresses: [address] });
      for (const txId of transactionIds) {
        try {
          const rawTransaction = await coreRPCClient.getRawTransaction(txId, 1);
          const inputs = rawTransaction.vin;
          const outputs = rawTransaction.vout;
          let isInput = false;
          let amount = 0;
          if (!inputs.some(input => input.address === address)) {
            isInput = true;
            for (const output of outputs) {
              if (output.scriptPubKey.addresses.includes(address)) {
                amount += output.value;
              }
            }
          } else {
            isInput = false;
            for (const output of outputs) {
              if (!output.scriptPubKey.addresses.includes(address)) {
                amount += output.value;
              }
            }
          }
          const time = moment(new Date(rawTransaction.blocktime * 1000)
            .toUTCString()).format('YYYY-MM-DDTHH:mm:ss.SSSSSS[Z]');
          const details = new TransactionDetail();
          details.setId(txId);
          details.setAmount(amount);
          details.setIsInput(isInput);
          details.setTimeUtc(time);

          transactionDetails.push(details);
        } catch (e) {
          if (e.code === -5) {
            throw new NotFoundGrpcError('Transaction not found');
          }
          throw e;
        }
      }
    } catch (e) {
      if (e.code === -5) {
        throw new NotFoundGrpcError('Invalid address');
      }
      throw e;
    }

    transactionDetails = transactionDetails.map((detail) => {
      return {
        date: new Date(detail.getTimeUtc()),
        id: detail.getId(),
        detail,
      };
    }).sort((detail1, detail2) => {
      if (detail2.date === detail1.date) {
        return detail2.id < detail1.id;
      }
      return detail2.date - detail1.date;
    }).map(item => item.detail);
    transactionDetails.sort((detail1, detail2) => detail2.getTimeUtc() - detail1.getTimeUtc());
    const response = new GetAddressTransactionsResponse();
    const limit = request.getLimit();
    const offset = request.getOffset();
    if (!limit && !offset) { // return all data
      for (const detail of transactionDetails) {
        response.addTransactions(detail);
      }
    } else if (!offset) { // undefined or 0, return limit count details
      for (let i = 0; i < transactionDetails.length && i < limit; i++) {
        response.addTransactions(transactionDetails[i]);
      }
    } else if (offset && limit) {
      if (offset <= transactionDetails.length) {
        for (let i = offset - 1; i < transactionDetails.length && i < limit + offset - 1; i++) {
          response.addTransactions(transactionDetails[i]);
        }
      }
    }
    return response;
  }

  return getAddressTransactionsHandler;
}

module.exports = getAddressTransactionsHandlerFactory;
