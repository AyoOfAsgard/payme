import React, { useState } from 'react';
import { ethers } from 'ethers';

// This ABI is for the Base Name resolver contract
const baseNameResolverABI = [
  "function resolve(string calldata name) external view returns (address)",
];

const baseNameResolverAddress = "0x4DE1bCf2B7E851E31216fC07989caA902A604784"; // Base Name resolver contract address

function BaseNameLookup({ onAddressFound }) {
  const [baseName, setBaseName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookupBaseName = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const baseNameResolver = new ethers.Contract(baseNameResolverAddress, baseNameResolverABI, provider);
      
      const address = await baseNameResolver.resolve(baseName);
      onAddressFound(address);
    } catch (err) {
      setError('Failed to resolve Base Name. Make sure it exists and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={baseName}
        onChange={(e) => setBaseName(e.target.value)}
        placeholder="Enter Base Name"
      />
      <button onClick={lookupBaseName} disabled={loading}>
        {loading ? 'Looking up...' : 'Lookup Base Name'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default BaseNameLookup;