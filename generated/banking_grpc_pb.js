// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var banking_pb = require('./banking_pb.js');

function serialize_banking_CreateUserPayload(arg) {
  if (!(arg instanceof banking_pb.CreateUserPayload)) {
    throw new Error('Expected argument of type banking.CreateUserPayload');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_banking_CreateUserPayload(buffer_arg) {
  return banking_pb.CreateUserPayload.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_banking_CreateUserResponse(arg) {
  if (!(arg instanceof banking_pb.CreateUserResponse)) {
    throw new Error('Expected argument of type banking.CreateUserResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_banking_CreateUserResponse(buffer_arg) {
  return banking_pb.CreateUserResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_banking_DepositRequest(arg) {
  if (!(arg instanceof banking_pb.DepositRequest)) {
    throw new Error('Expected argument of type banking.DepositRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_banking_DepositRequest(buffer_arg) {
  return banking_pb.DepositRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_banking_DepositResponse(arg) {
  if (!(arg instanceof banking_pb.DepositResponse)) {
    throw new Error('Expected argument of type banking.DepositResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_banking_DepositResponse(buffer_arg) {
  return banking_pb.DepositResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_banking_GetBalanceRequest(arg) {
  if (!(arg instanceof banking_pb.GetBalanceRequest)) {
    throw new Error('Expected argument of type banking.GetBalanceRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_banking_GetBalanceRequest(buffer_arg) {
  return banking_pb.GetBalanceRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_banking_GetBalanceResponse(arg) {
  if (!(arg instanceof banking_pb.GetBalanceResponse)) {
    throw new Error('Expected argument of type banking.GetBalanceResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_banking_GetBalanceResponse(buffer_arg) {
  return banking_pb.GetBalanceResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_banking_SendMoneyRequest(arg) {
  if (!(arg instanceof banking_pb.SendMoneyRequest)) {
    throw new Error('Expected argument of type banking.SendMoneyRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_banking_SendMoneyRequest(buffer_arg) {
  return banking_pb.SendMoneyRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_banking_SendMoneyResponse(arg) {
  if (!(arg instanceof banking_pb.SendMoneyResponse)) {
    throw new Error('Expected argument of type banking.SendMoneyResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_banking_SendMoneyResponse(buffer_arg) {
  return banking_pb.SendMoneyResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_banking_WithdrawRequest(arg) {
  if (!(arg instanceof banking_pb.WithdrawRequest)) {
    throw new Error('Expected argument of type banking.WithdrawRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_banking_WithdrawRequest(buffer_arg) {
  return banking_pb.WithdrawRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_banking_WithdrawResponse(arg) {
  if (!(arg instanceof banking_pb.WithdrawResponse)) {
    throw new Error('Expected argument of type banking.WithdrawResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_banking_WithdrawResponse(buffer_arg) {
  return banking_pb.WithdrawResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var CreateBankingServiceService = exports.CreateBankingServiceService = {
  createUser: {
    path: '/banking.CreateBankingService/CreateUser',
    requestStream: false,
    responseStream: false,
    requestType: banking_pb.CreateUserPayload,
    responseType: banking_pb.CreateUserResponse,
    requestSerialize: serialize_banking_CreateUserPayload,
    requestDeserialize: deserialize_banking_CreateUserPayload,
    responseSerialize: serialize_banking_CreateUserResponse,
    responseDeserialize: deserialize_banking_CreateUserResponse,
  },
  deposit: {
    path: '/banking.CreateBankingService/Deposit',
    requestStream: false,
    responseStream: false,
    requestType: banking_pb.DepositRequest,
    responseType: banking_pb.DepositResponse,
    requestSerialize: serialize_banking_DepositRequest,
    requestDeserialize: deserialize_banking_DepositRequest,
    responseSerialize: serialize_banking_DepositResponse,
    responseDeserialize: deserialize_banking_DepositResponse,
  },
  withdraw: {
    path: '/banking.CreateBankingService/Withdraw',
    requestStream: false,
    responseStream: false,
    requestType: banking_pb.WithdrawRequest,
    responseType: banking_pb.WithdrawResponse,
    requestSerialize: serialize_banking_WithdrawRequest,
    requestDeserialize: deserialize_banking_WithdrawRequest,
    responseSerialize: serialize_banking_WithdrawResponse,
    responseDeserialize: deserialize_banking_WithdrawResponse,
  },
  getBalance: {
    path: '/banking.CreateBankingService/GetBalance',
    requestStream: false,
    responseStream: false,
    requestType: banking_pb.GetBalanceRequest,
    responseType: banking_pb.GetBalanceResponse,
    requestSerialize: serialize_banking_GetBalanceRequest,
    requestDeserialize: deserialize_banking_GetBalanceRequest,
    responseSerialize: serialize_banking_GetBalanceResponse,
    responseDeserialize: deserialize_banking_GetBalanceResponse,
  },
  sendMoney: {
    path: '/banking.CreateBankingService/SendMoney',
    requestStream: false,
    responseStream: false,
    requestType: banking_pb.SendMoneyRequest,
    responseType: banking_pb.SendMoneyResponse,
    requestSerialize: serialize_banking_SendMoneyRequest,
    requestDeserialize: deserialize_banking_SendMoneyRequest,
    responseSerialize: serialize_banking_SendMoneyResponse,
    responseDeserialize: deserialize_banking_SendMoneyResponse,
  },
};

exports.CreateBankingServiceClient = grpc.makeGenericClientConstructor(CreateBankingServiceService, 'CreateBankingService');
