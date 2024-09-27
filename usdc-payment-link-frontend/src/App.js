import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import CreatePaymentLink from './CreatePaymentLink';
import MakePayment from './MakePayment';
import PaymentPage from './PaymentPage';
import { provider } from './coinbaseWalletSetup';
import contractABI from './contractABI.json';

const contractAddress = '0x53cFb309a7BfA130830B91F2D88DDFf683Ee7633'; // Add your deployed contract address here

function App() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        
        setContract(contractInstance);
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Error initializing app:", error);
      }
    };

    init();
  }, []);

  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/create">Create Payment Link</Link></li>
          </ul>
        </nav>

        <h1>USDC Payment Link System</h1>
        {account ? (
          <p>Connected Account: {account}</p>
        ) : (
          <p>Please connect your wallet to use this app.</p>
        )}

        <Routes>
          <Route path="/" element={<MakePayment contract={contract} />} />
          <Route path="/create" element={<CreatePaymentLink contract={contract} />} />
          <Route path="/pay/:requestId" element={<PaymentPage contract={contract} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;