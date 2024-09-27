const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("USDCPaymentLink", function () {
  let USDCPaymentLink;
  let usdcPaymentLink;
  let owner;
  let addr1;
  let addr2;
  let usdcToken;

  beforeEach(async function () {
    try {
      // Deploy a mock USDC token
      const MockUSDC = await ethers.getContractFactory("MockUSDC");
      usdcToken = await MockUSDC.deploy();
      console.log("MockUSDC deployed at:", await usdcToken.getAddress());

      // Deploy the USDCPaymentLink contract
      USDCPaymentLink = await ethers.getContractFactory("USDCPaymentLink");
      [owner, addr1, addr2] = await ethers.getSigners();
      console.log("Deploying USDCPaymentLink with USDC address:", await usdcToken.getAddress());
      usdcPaymentLink = await USDCPaymentLink.deploy(await usdcToken.getAddress());
      console.log("USDCPaymentLink deployed at:", await usdcPaymentLink.getAddress());

      // Mint some USDC tokens to addr1
      await usdcToken.mint(addr1.address, ethers.parseUnits("1000", 6));
      await usdcToken.connect(addr1).approve(await usdcPaymentLink.getAddress(), ethers.parseUnits("1000", 6));
    } catch (error) {
      console.error("Error in beforeEach:", error);
      throw error;
    }
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await usdcPaymentLink.owner()).to.equal(owner.address);
    });

    it("Should set the correct USDC token address", async function () {
      expect(await usdcPaymentLink.usdcToken()).to.equal(await usdcToken.getAddress());
    });
  });

  describe("Creating payment requests", function () {
    it("Should allow owner to create a payment request", async function () {
      const amount = ethers.parseUnits("100", 6);
      const tx = await usdcPaymentLink.createPaymentRequest(addr1.address, amount, "Test payment");
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.eventName === 'PaymentRequestCreated');
      expect(event).to.not.be.undefined;
      expect(event.args.recipient).to.equal(addr1.address);
      expect(event.args.amount).to.equal(amount);
      expect(event.args.description).to.equal("Test payment");
    });

    it("Should not allow non-owners to create a payment request", async function () {
      const amount = ethers.parseUnits("100", 6);
      await expect(
        usdcPaymentLink.connect(addr1).createPaymentRequest(addr2.address, amount, "Test payment")
      ).to.be.revertedWith("Only owner can create payment requests");
    });
  });

  describe("Making payments", function () {
    it("Should allow users to make payments", async function () {
      const amount = ethers.parseUnits("100", 6);
      const tx = await usdcPaymentLink.createPaymentRequest(addr2.address, amount, "Test payment");
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.eventName === 'PaymentRequestCreated');
      const requestId = event.args.requestId;

      await expect(
        usdcPaymentLink.connect(addr1).makePayment(requestId)
      ).to.changeTokenBalances(
        usdcToken,
        [addr1, addr2],
        [amount * BigInt(-1), amount]
      );
    });

    it("Should not allow double payments", async function () {
      const amount = ethers.parseUnits("100", 6);
      const tx = await usdcPaymentLink.createPaymentRequest(addr2.address, amount, "Test payment");
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.eventName === 'PaymentRequestCreated');
      const requestId = event.args.requestId;

      await usdcPaymentLink.connect(addr1).makePayment(requestId);

      await expect(
        usdcPaymentLink.connect(addr1).makePayment(requestId)
      ).to.be.revertedWith("Payment already made");
    });
  });
});