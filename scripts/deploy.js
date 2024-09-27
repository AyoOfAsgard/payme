const hre = require("hardhat");

async function main() {
  const USDCPaymentLink = await hre.ethers.getContractFactory("USDCPaymentLink");
  const usdcPaymentLink = await USDCPaymentLink.deploy("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913");

  await usdcPaymentLink.waitForDeployment();

  console.log("USDCPaymentLink deployed to:", usdcPaymentLink.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});