import { useEffect, useState } from 'react';

const CONTRACT_ADDRESS = 'TXf6VxedZiDsE1NoMcAE3vKnh6fdjppoG3';
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

  useEffect(() => {
    const init = async () => {
      if (!window.tronWeb || !window.tronWeb.defaultAddress.base58) {
        console.log("[USDT Viewer] Waiting for TronWeb...");
        return;
      }

      try {
        const userAddress = window.tronWeb.defaultAddress.base58;
        setAddress(userAddress);

        const contract = await window.tronWeb.contract(CONTRACT_ABI, CONTRACT_ADDRESS);

        // Fetch balance
        const balanceRaw = await contract.balanceOf(userAddress).call();
        setBalance(Number(balanceRaw) / 1e6);

        // Fetch expired token lots
        const [amounts, times] = await contract.getExpiredTokenLots(userAddress).call();
        const lots = amounts.map((a, i) => ({
          amount: Number(a) / 1e6,
          timestamp: Number(times[i])
        }));
        setExpiredLots(lots);
      } catch (error) {
        console.error("Error reading contract:", error);
      }
    };

    const checkTronWeb = setInterval(() => {
      if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
        clearInterval(checkTronWeb);
        init();
      }
    }, 500);
  }, []);

  return (
    <div style={{ fontFamily: 'Arial', padding: '2em' }}>
      <p style={{ background: "#fff3cd", color: "#856404", padding: "1em", borderRadius: "8px", border: "1px solid #ffeeba" }}>
        ⚠️ <strong>Note:</strong> This app requires the <a href="https://www.tronlink.org/" target="_blank" rel="noopener noreferrer">TronLink</a> wallet browser extension. Please make sure it is installed and unlocked.
      </p>

      <h2>USDTF Viewer</h2>

      <p><strong>Wallet Address:</strong><br />
        {address || "Connecting..."}</p>

      <p><strong>Spendable USDTF Balance:</strong><br />
        {balance !== null ? `${balance} USDTF` : "Loading..."}</p>

      <p><strong>Expired Token Lots:</strong><br />
        {expiredLots.length > 0 ? (
          <ul>
            {expiredLots.map((lot, index) => (
              <li key={index}>
                {lot.amount} USDTF (expired at {new Date(lot.timestamp * 1000).toLocaleString()})
              </li>
            ))}
          </ul>
        ) : "None"}
      </p>
    </div>
  );
}

export default App;
