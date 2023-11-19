require("dotenv").config();
const fetch = require("node-fetch");
const ethers = require("ethers");
const provider = new ethers.providers.JsonRpcProvider(process.env.GOERLI_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

module.exports.cowSwap = async (toAddress, amount) => {
  const { chainId } = await provider.getNetwork();
  const SETTLEMENT = new ethers.Contract(
    "0x9008D19f58AAbD9eD0D60971565AA8510560ab41",
    [],
    provider
  );

  const VAULT_RELAYER = new ethers.Contract(
    "0xC92E8bdf79f0507f65a392b0ab4667716BFE0110",
    [],
    provider
  );

  const COW = new ethers.Contract(
    "0x91056d4a53e1faa1a84306d4deaec71085394bc8",
    [],
    provider
  );

  const USDC = new ethers.Contract(
    "0x07865c6E87B9F70255377e024ace6630C1Eaa37F", //this is the url of the usdc smart contract
    [
      `
      function decimals() view returns (uint8)
    `,
      `
      function name() view returns (string)
    `,
      `
      function version() view returns (string)
    `,
      `
      function nonces(address owner) view returns (uint256)
    `,
      `
      function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
      )
    `,
    ],
    provider
  );

  const BRIDGER = new ethers.Contract(
    //"0xE71CcC8d4e0a298E1300a702ad0Ac93303dc8Ae5", //Contract is specified by them
    "0x53De37cEe0A2dA8231da4e357Ed7a2726ebf5F1D",
    [
      {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        inputs: [],
        name: "EPNS_COMM_ADDRESS",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        name: "transfer",
        outputs: [
          {
            internalType: "bool",
            name: "success",
            type: "bool",
          },
        ],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    provider
  );

  /*** Order Configuration ***/

  const orderConfig = {
    sellToken: USDC.address,
    buyToken: COW.address,
    sellAmount: `${ethers.utils.parseUnits("1.33", await USDC.decimals())}`,
    kind: "sell",
    partiallyFillable: false,
    sellTokenBalance: "erc20",
    buyTokenBalance: "erc20",
  };

  /*** EIP-2612 Permit ***/

  const permit = {
    owner: wallet.address,
    spender: VAULT_RELAYER.address,
    value: orderConfig.sellAmount,
    nonce: await USDC.nonces(wallet.address),
    deadline: ethers.constants.MaxUint256,
  };
  const permitSignature = ethers.utils.splitSignature(
    await wallet._signTypedData(
      {
        name: await USDC.name(),
        version: await USDC.version(),
        chainId,
        verifyingContract: USDC.address,
      },
      {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      },
      permit
    )
  );
  const permitParams = [
    permit.owner,
    permit.spender,
    permit.value,
    permit.deadline,
    permitSignature.v,
    permitSignature.r,
    permitSignature.s,
  ];
  const permitHook = {
    target: USDC.address,
    callData: USDC.interface.encodeFunctionData("permit", permitParams),
    gasLimit: `${await USDC.estimateGas.permit(...permitParams)}`,
  };

  /*** Bridging ***/
  //orderConfig.receiver = toAddress;
  orderConfig.receiver = toAddress;
  const bridgeHook = {
    target: BRIDGER.address,
    callData: BRIDGER.interface.encodeFunctionData("transfer", [
      toAddress,
      permit.value,
    ]),
    // Approximate gas limit determined with Tenderly.
    gasLimit: "228533",
  };
  /*** Order Creation ***/

  orderConfig.appData = JSON.stringify({
    metadata: {
      hooks: {
        pre: [permitHook],
        post: [bridgeHook],
      },
    },
  });
  const { id: quoteId, quote } = await fetch(
    "https://api.cow.fi/goerli/api/v1/quote",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: wallet.address,
        sellAmountBeforeFee: orderConfig.sellAmount,
        ...orderConfig,
      }),
    }
  ).then((response) => response.json());
  const orderData = {
    ...orderConfig,
    sellAmount: quote.sellAmount,
    buyAmount: `${ethers.BigNumber.from(quote.buyAmount).mul(99).div(100)}`,
    validTo: quote.validTo,
    appData: ethers.utils.id(orderConfig.appData),
    feeAmount: quote.feeAmount,
  };
  const orderSignature = await wallet._signTypedData(
    {
      name: "Gnosis Protocol",
      version: "v2",
      chainId,
      verifyingContract: SETTLEMENT.address,
    },
    {
      Order: [
        { name: "sellToken", type: "address" },
        { name: "buyToken", type: "address" },
        { name: "receiver", type: "address" },
        { name: "sellAmount", type: "uint256" },
        { name: "buyAmount", type: "uint256" },
        { name: "validTo", type: "uint32" },
        { name: "appData", type: "bytes32" },
        { name: "feeAmount", type: "uint256" },
        { name: "kind", type: "string" },
        { name: "partiallyFillable", type: "bool" },
        { name: "sellTokenBalance", type: "string" },
        { name: "buyTokenBalance", type: "string" },
      ],
    },
    orderData
  );
  const orderUid = await fetch("https://api.cow.fi/goerli/api/v1/orders", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      ...orderData,
      from: wallet.address,
      appData: orderConfig.appData,
      appDataHash: orderData.appData,
      signingScheme: "eip712",
      signature: orderSignature,
      quoteId,
    }),
  }).then((response) => response.json());
  console.log("Order id", orderUid);
  return orderUid;
};
