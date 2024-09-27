import React, { useState } from 'react';
import { ethers } from 'ethers';
import BaseNameLookup from './BaseNameLookup';

function CreatePaymentLink({ contract }) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddressFound = (address) => {
    setRecipient(address);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) return;

    setLoading(true);
    setError('');
    try {
      const amountInWei = ethers.parseUnits(amount, 6); // Assuming 6 decimal places for USDC
      const tx = await contract.createPaymentRequest(recipient, amountInWei, description);
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.eventName === 'PaymentRequestCreated');
      const requestId = event.args.requestId;

      // Create a payment link (you might want to use a more sophisticated method in production)
      const link = `${window.location.origin}/pay/${requestId}`;
      setPaymentLink(link);
    } catch (error) {
      console.error("Error creating payment link:", error);
      setError('Failed to create payment link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create Payment Link</h2>
      <BaseNameLookup onAddressFound={handleAddressFound} />
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <input
          type="text"
          placeholder="Amount (USDC)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Payment Link'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {paymentLink && (
        <div>
          <h3>Payment Link Created:</h3>
          <p>{paymentLink}</p>
        </div>
      )}
    </div>
  );
}

export default CreatePaymentLink;