import Transport from '@ledgerhq/hw-transport-webhid';
import AppEth from '@ledgerhq/hw-app-eth';
import * as sigUtil from '@metamask/eth-sig-util';

function calcSignature(res) {
  let v = res.v.toString(16);
  if (v.length < 2) {
    v = `0${v}`;
  }
  const signature = `0x${res.r}${res.s}${v}`;
  const addressSignedWith = sigUtil.recoverTypedSignature({
    data,
    signature: signature,
    version: sigUtil.SignTypedDataVersion.V4
  });

  return {
    signature,
    addressSignedWith
  };
}

window.signEIP712Message = async () => {
  const transport = await Transport.create();
  const eth = new AppEth(transport);
  try {
    const { address } = await eth.getAddress("44'/60'/0'/0/0");
    window.account.innerHTML = address;

    const res = await eth.signEIP712Message("44'/60'/0'/0/0", data);
    const { signature, addressSignedWith } = calcSignature(res);
    window.messageResult.innerHTML = JSON.stringify(res, null, 2);
    window.messageSign.innerHTML = signature;
    window.messageAccount.innerHTML = addressSignedWith;
  } catch (e) {
    console.log(e.message);
  } finally {
    transport.close();
  }
};

window.signEIP712HashedMessage = async () => {
  const { domain, types, primaryType, message } =
    sigUtil.TypedDataUtils.sanitizeData(data);
  const domainSeparatorHex = sigUtil.TypedDataUtils.hashStruct(
    'EIP712Domain',
    domain,
    types,
    sigUtil.SignTypedDataVersion.V4
  ).toString('hex');
  const hashStructMessageHex = sigUtil.TypedDataUtils.hashStruct(
    primaryType,
    message,
    types,
    sigUtil.SignTypedDataVersion.V4
  ).toString('hex');

  const transport = await Transport.create();
  const eth = new AppEth(transport);
  try {
    const { address } = await eth.getAddress("44'/60'/0'/0/0");
    window.account.innerHTML = address;

    const res = await eth.signEIP712HashedMessage(
      "44'/60'/0'/0/0",
      domainSeparatorHex,
      hashStructMessageHex
    );
    const { signature, addressSignedWith } = calcSignature(res);
    window.hashedMessageResult.innerHTML = JSON.stringify(res, null, 2);
    window.hashedMessageSign.innerHTML = signature;
    window.hashedMessageAccount.innerHTML = addressSignedWith;
  } catch (e) {
    console.log(e.message);
  } finally {
    transport.close();
  }
};

const data = {
  types: {
    BatchSignedERC721Orders: [
      { type: 'address', name: 'maker' },
      { type: 'uint256', name: 'listingTime' },
      { type: 'uint256', name: 'expiryTime' },
      { type: 'uint256', name: 'startNonce' },
      { type: 'address', name: 'erc20Token' },
      { type: 'address', name: 'platformFeeRecipient' },
      { type: 'BasicCollection[]', name: 'basicCollections' },
      { type: 'Collection[]', name: 'collections' },
      { type: 'uint256', name: 'hashNonce' }
    ],
    BasicCollection: [
      { type: 'address', name: 'nftAddress' },
      { type: 'bytes32', name: 'fee' },
      { type: 'bytes32[]', name: 'items' }
    ],
    Collection: [
      { type: 'address', name: 'nftAddress' },
      { type: 'bytes32', name: 'fee' },
      { type: 'OrderItem[]', name: 'items' }
    ],
    OrderItem: [
      { type: 'uint256', name: 'erc20TokenAmount' },
      { type: 'uint256', name: 'nftId' }
    ],
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' }
    ]
  },
  domain: {
    name: 'ElementEx',
    version: '1.0.0',
    chainId: '5000',
    verifyingContract: '0x2fa13cf695ec51ded5b8e45ad0bef838ab17e2af'
  },
  primaryType: 'BatchSignedERC721Orders',
  message: {
    maker: '0x6d3b90747dbf5883bf88ff7eb5fcc86f408b5409',
    listingTime: '1706688449',
    expiryTime: '1709280466',
    startNonce: '7',
    erc20Token: '0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9',
    platformFeeRecipient: '0x7538262ae993ca117a0e481f908209137a4626e',
    basicCollections: [
      {
        nftAddress: '0xaaaea1fb9f3de3f70e89f37b69ab11b47eb9ce6f',
        fee: '0x000000000000000000c80000000000000000000000000000000000000000000',
        items: [
          '0x000000000000000020c8558000000000000000000000000000000000000005d'
        ]
      }
    ],
    collections: [],
    hashNonce: '0'
  }
};
