import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import { provider } from './coinbaseWalletSetup';

function PaymentPage({ contract }) {
  const { requestId } = useParams();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [account, setAccount] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!contract) return;
      try {
        const details = await contract.paymentRequests(requestId);
        setPaymentDetails({
          recipient: details.recipient,
          amount: ethers.formatUnits(details.amount, 6),
          description: details.description,
          paid: details.paid
        });
      } catch (err) {
        console.error('Error fetching payment details:', err);
        setError('Failed to load payment details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [contract, requestId]);

  const handleCreateWallet = async () => {
    setLoading(true);
    setError('');
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    } catch (err) {
      console.error('Error creating wallet:', err);
      setError('Failed to create wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!contract || !account) return;
    setLoading(true);
    setError('');
    try {
      const tx = await contract.makePayment(requestId);
      setTransactionHash(tx.hash);
      await tx.wait();
      setPaymentDetails(prev => ({ ...prev, paid: true }));
    } catch (err) {
      console.error('Error making payment:', err);
      if (err.code === 'ACTION_REJECTED') {
        setError('Payment cancelled by user.');
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        setError('Insufficient funds to make the payment.');
      } else {
        setError('Payment failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!paymentDetails) return <div>No payment details found.</div>;

  return (
    <div>
      <h2>Payment Request</h2>
      <p>Recipient: {paymentDetails.recipient}</p>
      <p>Amount: {paymentDetails.amount} USDC</p>
      <p>Description: {paymentDetails.description}</p>
      <p>Status: {paymentDetails.paid ? 'Paid' : 'Unpaid'}</p>
      
      {!account && (
        <button onClick={handleCreateWallet} disabled={loading}>
          {loading ? 'Creating...' : 'Create Smart Wallet'}
        </button>
      )}
      
      {!paymentDetails.paid && account && (
        <button onClick={handlePayment} disabled={loading}>
          {loading ? 'Processing...' : 'Make Payment with Smart Wallet'}
        </button>
      )}

      {transactionHash && (
        <p>Transaction submitted: {transactionHash}</p>
      )}
    </div>
  );
}

export default PaymentPage;