import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';

const sdk = new CoinbaseWalletSDK({
  appName: "USDC Payment Link System",
  appChainIds: [8453], // Base network
  appLogoUrl: '' // Replace with your app's logo URL
});

// Create provider with smartWalletOnly option
const provider = sdk.makeWeb3Provider({ options: 'smartWalletOnly' });

export { sdk, provider };