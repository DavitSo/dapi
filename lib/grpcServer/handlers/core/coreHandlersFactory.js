const {
  client: {
    converters: {
      jsonToProtobufFactory,
      protobufToJsonFactory,
    },
  },
  server: {
    jsonToProtobufHandlerWrapper,
    error: {
      wrapInErrorHandlerFactory,
    },
  },
} = require('@dashevo/grpc-common');

const {
  v0: {
    BroadcastTransactionRequest,
    GetTransactionRequest,
    GetStatusRequest,
    GetBlockRequest,
    GetAddressBalanceRequest,
    pbjs: {
      BroadcastTransactionRequest: PBJSBroadcastTransactionRequest,
      BroadcastTransactionResponse: PBJSBroadcastTransactionResponse,
      GetTransactionRequest: PBJSGetTransactionRequest,
      GetTransactionResponse: PBJSGetTransactionResponse,
      GetStatusRequest: PBJSGetStatusRequest,
      GetStatusResponse: PBJSGetStatusResponse,
      GetBlockRequest: PBJSGetBlockRequest,
      GetBlockResponse: PBJSGetBlockResponse,
      GetAddressBalanceRequest: PBJSGetAddressBalanceRequest,
      GetAddressBalanceResponse: PBJSGetAddressBalanceResponse,
    },
  },
} = require('@dashevo/dapi-grpc');

const log = require('../../../log');

const getBlockHandlerFactory = require(
  './getBlockHandlerFactory',
);
const getStatusHandlerFactory = require(
  './getStatusHandlerFactory',
);
const getTransactionHandlerFactory = require(
  './getTransactionHandlerFactory',
);
const broadcastTransactionHandlerFactory = require(
  './broadcastTransactionHandlerFactory',
);
const getAddressBalanceHandlerFactory = require(
  './getAddressBalanceHandlerFactory',
);

/**
 * @param {CoreRpcClient} coreRPCClient
 * @param {boolean} isProductionEnvironment
 * @returns {Object<string, function>}
 */
function coreHandlersFactory(coreRPCClient, isProductionEnvironment) {
  const wrapInErrorHandler = wrapInErrorHandlerFactory(log, isProductionEnvironment);

  // getBlock
  const getBlockHandler = getBlockHandlerFactory(coreRPCClient);
  const wrappedGetBlock = jsonToProtobufHandlerWrapper(
    jsonToProtobufFactory(
      GetBlockRequest,
      PBJSGetBlockRequest,
    ),
    protobufToJsonFactory(
      PBJSGetBlockResponse,
    ),
    wrapInErrorHandler(getBlockHandler),
  );

  // getStatus
  const getStatusHandler = getStatusHandlerFactory(coreRPCClient);
  const wrappedGetStatus = jsonToProtobufHandlerWrapper(
    jsonToProtobufFactory(
      GetStatusRequest,
      PBJSGetStatusRequest,
    ),
    protobufToJsonFactory(
      PBJSGetStatusResponse,
    ),
    wrapInErrorHandler(getStatusHandler),
  );

  // getTransaction
  const getTransactionHandler = getTransactionHandlerFactory(coreRPCClient);
  const wrappedGetTransaction = jsonToProtobufHandlerWrapper(
    jsonToProtobufFactory(
      GetTransactionRequest,
      PBJSGetTransactionRequest,
    ),
    protobufToJsonFactory(
      PBJSGetTransactionResponse,
    ),
    wrapInErrorHandler(getTransactionHandler),
  );

  // broadcastTransaction
  const broadcastTransactionHandler = broadcastTransactionHandlerFactory(coreRPCClient);
  const wrappedBroadcastTransaction = jsonToProtobufHandlerWrapper(
    jsonToProtobufFactory(
      BroadcastTransactionRequest,
      PBJSBroadcastTransactionRequest,
    ),
    protobufToJsonFactory(
      PBJSBroadcastTransactionResponse,
    ),
    wrapInErrorHandler(broadcastTransactionHandler),
  );

  // getAddressBalance
  const getAddressBalanceHandler = getAddressBalanceHandlerFactory(coreRPCClient);
  const wrappedGetAddressBalance = jsonToProtobufHandlerWrapper(
    jsonToProtobufFactory(
      GetAddressBalanceRequest,
      PBJSGetAddressBalanceRequest,
    ),
    protobufToJsonFactory(
      PBJSGetAddressBalanceResponse,
    ),
    wrapInErrorHandler(getAddressBalanceHandler),
  );

  return {
    getBlock: wrappedGetBlock,
    getStatus: wrappedGetStatus,
    getTransaction: wrappedGetTransaction,
    broadcastTransaction: wrappedBroadcastTransaction,
    getAddressBalance: wrappedGetAddressBalance,
  };
}

module.exports = coreHandlersFactory;
