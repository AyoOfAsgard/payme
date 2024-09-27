import React, { useState } from 'react';

function MakePayment({ contract }) {
  const [requestId, setRequestId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) return;

    try {
      const tx = await contract.makePayment(requestId);
      await tx.wait();
      setPaymentStatus('Payment successful!');
    } catch (error) {
      console.error("Error making payment:", error);
      setPaymentStatus('Payment failed. Please try again.');
    }
  };

  return (
    <div>
      <h2>Make Payment</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Request ID"
          value={requestId}
          onChange={(e) => setRequestId(e.target.value)}
        />
        <button type="submit">Make Payment</button>
      </form>
      {paymentStatus && <p>{paymentStatus}</p>}
    </div>
  );
}

export default MakePayment;