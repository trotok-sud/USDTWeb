import { useEffect, useState } from 'react';
import TronWeb from 'tronweb';
import './App.css';

const CONTRACT_ADDRESS = 'TCL6M2NnQ1Ath5MgYqpRuJBN1zXjuZa5F4';

const USDTF_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  }
];

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [tronWeb, setTronWeb] = useState(null);
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [balance, setBalance] = useState(null);
  const [checkAddress, setCheckAddress] = useState('');
  const [checkedBalance, setCheckedBalance] = useState(null);

  useEffect(() => {
    const connectWallet = async () => {
      if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
        setTronWeb(window.tronWeb);
        setWalletAddress(window.tronWeb.defaultAddress.base58);
      }
    };
    connectWallet();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!walletAddress || !tronWeb) return;
      try {
        const contract = await tronWeb.contract(USDTF_ABI, CONTRACT_ADDRESS);
        const name = await contract.name().call();
        const symbol = await contract.symbol().call();
        const bal = await contract.balanceOf(walletAddress).call();
        setTokenName(name);
        setTokenSymbol(symbol);
        setBalance(tronWeb.fromSun(bal));
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, [tronWeb, walletAddress]);

  const checkOtherBalance = async () => {
    if (!tronWeb || !checkAddress) return;
    try {
      const contract = await tronWeb.contract(USDTF_ABI, CONTRACT_ADDRESS);
      const bal = await contract.balanceOf(checkAddress).call();
      setCheckedBalance(tronWeb.fromSun(bal));
    } catch (err) {
      console.error('Check balance failed:', err);
      alert('Could not fetch balance. Make sure address is valid.');
    }
  };

  return (
    <div className="container">
      <h1>USDTF Token Viewer</h1>
      <p><strong>Smart Contract Address:</strong> {CONTRACT_ADDRESS}</p>
      <p><strong>Project:</strong> USDTF - TRON-based token for educational purposes</p>

      {walletAddress ? (
        <>
          <p><strong>Connected Wallet:</strong> {walletAddress}</p>
          <p><strong>Token Name:</strong> {tokenName}</p>
          <p><strong>Symbol:</strong> {tokenSymbol}</p>
          <p><strong>Your Balance:</strong> {balance} {tokenSymbol}</p>
        </>
      ) : (
        <p>Please connect TronLink wallet.</p>
      )}

      <h2>Check Token Balance by Address</h2>
      <input
        type="text"
        placeholder="Enter TRON wallet address"
        value={checkAddress}
        onChange={(e) => setCheckAddress(e.target.value)}
      />
      <button onClick={checkOtherBalance}>Check Balance</button>
      {checkedBalance !== null && (
        <p><strong>Balance:</strong> {checkedBalance} {tokenSymbol}</p>
      )}

      <footer>
        <hr />
        <p>
          <a href="https://trotok-sud.github.io/USDTWeb" target="_blank">Official Website</a> |{' '}
          <a href="https://github.com/trotok-sud/USDTF" target="_blank">Source Code</a> |{' '}
          <a href="https://github.com/trotok-sud/USDTF/blob/main/docs/Usdtf%20Audit%20Report.pdf" target="_blank">Audit Report</a>
        </p>
        <p>&copy; 2025 USDTF Token. Educational Use Only.</p>
      </footer>
    </div>
  );
}

export default App;
