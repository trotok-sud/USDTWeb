import { useEffect, useState } from 'react';

const CONTRACT_ADDRESS = 'TCL6M2NnQ1Ath5MgYqpRuJBN1zXjuZa5F4';
const CONTRACT_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'getExpiredTokenLots',
    outputs: [
      { name: '', type: 'uint256[]' },
      { name: '', type: 'uint256[]' }
    ],
    type: 'function',
  }
];

function App() {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [expiredLots, setExpiredLots] = useState([]);

  const [contract, setContract] = useState(null);

  // Initialize wallet and contract
  useEffect(() => {
    const init = async () => {
      if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
        const addr = window.tronWeb.defaultAddress.base58;
        setAddress(addr);

        const ctr = await window.tronWeb.contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        setContract(ctr);
      }
    };

    init();
  }, []);

  // Fetch balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const result = await contract.balanceOf(address).call();
        setBalance(Number(result));
      } catch (error) {
        console.error("Error fetching spendable balance:", error);
        setBalance(0);
      }
    };

    if (contract && address) {
      fetchBalance();
    }
  }, [contract, address]);

  // Fetch expired lots
  useEffect(() => {
    const fetchExpiredLots = async () => {
      try {
        const result = await contract.getExpiredTokenLots(address).call();
        const amounts = result[0];
        const timestamps = result[1];

        const lots = amounts.map((amt, idx) => ({
          amount: Number(amt) / 1_000_000,
          timestamp: Number(timestamps[idx])
        }));

        setExpiredLots(lots);
      } catch (error) {
        console.error("Error fetching expired lots:", error);
        setExpiredLots([]);
      }
    };

    if (contract && address) {
      fetchExpiredLots();
    }
  }, [contract, address]);

  return (
    <div style={{ fontFamily: 'Arial', padding: '2em' }}>
      <p style={{ background: "#fff3cd", color: "#856404", padding: "1em", borderRadius: "8px", border: "1px solid #ffeeba" }}>
        ⚠️ <strong>Note:</strong> This app requires the <a href="https://www.tronlink.org/" target="_blank" rel="noopener noreferrer">TronLink</a> wallet browser extension. Please make sure it is installed and unlocked.
      </p>

      <h2>USDTF Viewer</h2>

      <p><strong>Wallet Address:</strong><br />
        {address || "Connecting..."}</p>

      <p>
        <strong>Spendable USDTF Balance:</strong><br />
        {balance === null ? "Loading..." : `${balance / 1_000_000} USDTF`}
      </p>

      <p><strong>Expired Token Lots:</strong><br />
        {expiredLots.length === 0 ? (
          <p>No expired token lots.</p>
        ) : (
          <ul>
            {expiredLots.map((lot, index) => (
              <li key={index}>
                {lot.amount} USDTF (expired at {new Date(lot.timestamp * 1000).toLocaleString()})
              </li>
            ))}
          </ul>
        )}
      </p>
    </div>
  );
}

export default App;
