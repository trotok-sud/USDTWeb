import { useEffect, useState } from 'react';
import TronWeb from 'tronweb';
import { ethers } from 'ethers';
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
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: 'success', type: 'bool' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_amount', type: 'uint256' }
    ],
    name: 'mint',
    outputs: [],
    type: 'function',
  }
];

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [tronWeb, setTronWeb] = useState(null);
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [balance, setBalance] = useState(null);
  const [providerType, setProviderType] = useState(null);
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [mintTo, setMintTo] = useState('');
  const [mintAmount, setMintAmount] = useState('');

  useEffect(() => {
    const connectWallet = async () => {
      if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
        setTronWeb(window.tronWeb);
        setWalletAddress(window.tronWeb.defaultAddress.base58);
        setProviderType('tron');
      } else if (window.BinanceChain) {
        try {
          const accounts = await window.BinanceChain.request({ method: 'eth_requestAccounts' });
          setWalletAddress(accounts[0]);
          setProviderType('binance');
        } catch (err) {
          console.error('Binance Wallet connection failed:', err);
        }
      } else if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setWalletAddress(accounts[0]);
          setProviderType('metamask');
        } catch (err) {
          console.error('MetaMask connection failed:', err);
        }
      }
    };
    connectWallet();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!walletAddress) return;
      try {
        if (providerType === 'tron' && tronWeb) {
          const contract = await tronWeb.contract(USDTF_ABI, CONTRACT_ADDRESS);
          const name = await contract.name().call();
          const symbol = await contract.symbol().call();
          const bal = await contract.balanceOf(walletAddress).call();
          setTokenName(name);
          setTokenSymbol(symbol);
          setBalance(tronWeb.fromSun(bal));
        } else {
          setTokenName('USDTF');
          setTokenSymbol('USDTF');
          setBalance('N/A on EVM wallet');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, [tronWeb, walletAddress, providerType]);

  const transferTokens = async () => {
    if (!tronWeb || providerType !== 'tron') return;
    try {
      const contract = await tronWeb.contract(USDTF_ABI, CONTRACT_ADDRESS);
      await contract.transfer(transferTo, tronWeb.toSun(transferAmount)).send();
      alert('Transfer successful');
    } catch (err) {
      console.error('Transfer failed:', err);
      alert('Transfer failed');
    }
  };

  const mintTokens = async () => {
    if (!tronWeb || providerType !== 'tron') return;
    try {
      const contract = await tronWeb.contract(USDTF_ABI, CONTRACT_ADDRESS);
      await contract.mint(mintTo, tronWeb.toSun(mintAmount)).send();
      alert('Mint successful');
    } catch (err) {
      console.error('Minting failed:', err);
      alert('Minting failed');
    }
  };

  const getInstallMessage = () => {
    if (!window.tronWeb && !window.BinanceChain && !window.ethereum) {
      return (
        <p>
          Please install <a href="https://www.tronlink.org/" target="_blank" rel="noopener noreferrer">TronLink</a>,{' '}
          <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">MetaMask</a>, or{' '}
          <a href="https://www.binance.org/en/wallet" target="_blank" rel="noopener noreferrer">Binance Wallet</a> extension to use this site.
        </p>
      );
    }
    return null;
  };

  return (
    <div className="container">
      <img
        src="/logo.png"
        alt="USDTF Logo"
        style={{
          width: '120px',
          height: '120px',
          display: 'block',
          margin: '1rem auto'
        }}
      />

      />
      <h1>USDTF Token Viewer</h1>
      <p><strong>Smart Contract Address:</strong> {CONTRACT_ADDRESS}</p>
      <p><strong>Project:</strong> USDTF is a TRON-based stable token designed for peer-to-peer educational and experimental use.</p>

      {walletAddress ? (
        <>
          <p><strong>Token Name:</strong> {tokenName}</p>
          <p><strong>Symbol:</strong> {tokenSymbol}</p>
          <p><strong>Balance:</strong> {balance} {tokenSymbol}</p>

          <h2>Transfer Tokens</h2>
          <input type="text" placeholder="Recipient Address" value={transferTo} onChange={(e) => setTransferTo(e.target.value)} />
          <input type="number" placeholder="Amount" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} />
          <button onClick={transferTokens}>Transfer</button>

          <h2>Mint Tokens (Owner Only)</h2>
          <input type="text" placeholder="Recipient Address" value={mintTo} onChange={(e) => setMintTo(e.target.value)} />
          <input type="number" placeholder="Amount" value={mintAmount} onChange={(e) => setMintAmount(e.target.value)} />
          <button onClick={mintTokens}>Mint</button>
        </>
      ) : (
        <>
          <p>Please connect your TronLink, MetaMask, or Binance Wallet to interact with the contract.</p>
          {getInstallMessage()}
        </>
      )}

      <footer>
        <hr />
        <p>
          <a href="https://trotok-sud.github.io/USDTWeb" target="_blank">Official Website</a> |{' '}
          <a href="https://github.com/trotok-sud/USDTF" target="_blank">GitHub</a> |{' '}
          <a href="https://github.com/trotok-sud/USDTF/blob/main/docs/Usdtf%20Audit%20Report.pdf" target="_blank">Audit Report</a>
        </p>
        <p>&copy; 2025 Trotok Development Team</p>
      </footer>
    </div>
  );
}

export default App;
