const fs = require('fs');
const path = require('path');

// Path to the compiled contract JSON file
const contractJsonPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'USDCPaymentLink.sol', 'USDCPaymentLink.json');

// Read the JSON file
const contractJson = require(contractJsonPath);

// Extract the ABI
const abi = contractJson.abi;

// Convert the ABI to a string
const abiString = JSON.stringify(abi, null, 2);

// Path where we want to save our ABI file
const abiFilePath = path.join(__dirname, '..', 'usdc-payment-link-frontend', 'src', 'contractABI.json');

// Write the ABI to a new file
fs.writeFileSync(abiFilePath, abiString);

console.log(`ABI has been extracted and saved to ${abiFilePath}`);