// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract USDCPaymentLink {
    using Address for address;

    IERC20 public usdcToken;
    address public owner;
    mapping(bytes32 => PaymentRequest) public paymentRequests;

    struct PaymentRequest {
        address recipient;
        uint256 amount;
        string description;
        bool paid;
    }

    event PaymentRequestCreated(bytes32 indexed requestId, address indexed recipient, uint256 amount, string description);
    event PaymentReceived(bytes32 indexed requestId, address indexed sender, uint256 amount);

    constructor(address _usdcTokenAddress) {
        require(_usdcTokenAddress != address(0), "Invalid USDC token address");
        usdcToken = IERC20(_usdcTokenAddress);
        owner = msg.sender;
    }

    function createPaymentRequest(address _recipient, uint256 _amount, string memory _description) external returns (bytes32) {
        require(msg.sender == owner, "Only owner can create payment requests");
        bytes32 requestId = keccak256(abi.encodePacked(_recipient, _amount, _description, block.timestamp));
        paymentRequests[requestId] = PaymentRequest(_recipient, _amount, _description, false);
        emit PaymentRequestCreated(requestId, _recipient, _amount, _description);
        return requestId;
    }

    function makePayment(bytes32 _requestId) external {
        PaymentRequest storage request = paymentRequests[_requestId];
        require(!request.paid, "Payment already made");
        require(usdcToken.transferFrom(msg.sender, request.recipient, request.amount), "Transfer failed");
        request.paid = true;
        emit PaymentReceived(_requestId, msg.sender, request.amount);
    }

    // Additional functions for managing payment requests, checking status, etc. can be added here
}