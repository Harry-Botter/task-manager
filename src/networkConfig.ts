import { getFullnodeUrl } from '@mysten/sui/client';
import { createNetworkConfig } from '@mysten/dapp-kit';

// Devnetのみに制限
const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
  devnet: {
    url: getFullnodeUrl('devnet'),
  },
});

export { networkConfig, useNetworkVariable, useNetworkVariables };

/*ここからしたが元々あったやつ。devnetを接続させるために一時待機*/
// import { getFullnodeUrl } from "@mysten/sui/client";
// import { createNetworkConfig } from "@mysten/dapp-kit";

// const { networkConfig, useNetworkVariable, useNetworkVariables } =
//   createNetworkConfig({
//     devnet: {
//       url: getFullnodeUrl("devnet"),
//     },
//     testnet: {
//       url: getFullnodeUrl("testnet"),
//     },
//     mainnet: {
//       url: getFullnodeUrl("mainnet"),
//     },
//   });

// export { useNetworkVariable, useNetworkVariables, networkConfig };