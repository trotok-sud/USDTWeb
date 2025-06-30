import { useEffect, useState } from "react";
import TronWeb from "tronweb";
import "./App.css";

const CONTRACT_ADDRESS = "TCL6M2NnQ1Ath5MgYqpRuJBN1zXjuZa5F4";

const USDTF_ABI = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "account", type: "address" }],
    name: "getAllTokenLots",
    outputs: [
      { name: "indexes", type: "uint256[]" },
      { name: "amounts", type: "uint256[]" },
      { name: "expiries", type: "uint256[]" },
      { name: "isActive", type: "bool[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [tronWeb, setTronWeb] = useState(null);
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [balance, setBalance] = useState(null);
  const [checkAddress, setCheckAddress] = useState("");
  const [checkedBalance, setCheckedBalance] = useState(null);

  const [tokenLots, setTokenLots] = useState([]);
  const [checkedTokenLots, setCheckedTokenLots] = useState([]);

  useEffect(() => {
    if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
      setTronWeb(window.tronWeb);
      setWalletAddress(window.tronWeb.defaultAddress.base58);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!walletAddress || !tronWeb) return;
      try {
        const contract = await tronWeb.contract(USDTF_ABI, CONTRACT_ADDRESS);

        // fetch token details
        const name = await contract.name().call();
        const symbol = await contract.symbol().call();
        const bal = await contract.balanceOf(walletAddress).call();

        setTokenName(name);
        setTokenSymbol(symbol);
        setBalance(tronWeb.fromSun(bal));

        // fetch token lots
        fetchTokenLots(walletAddress, setTokenLots, tronWeb, contract);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [tronWeb, walletAddress]);

  const fetchTokenLots = async (address, setLots, tronWebInstance, contractInstance) => {
    if (!address || !tronWebInstance) return;

    try {
      const contract = contractInstance
        ? contractInstance
        : await tronWebInstance.contract(USDTF_ABI, CONTRACT_ADDRESS);
      const result = await contract.getAllTokenLots(address).call();

      const lots = [];
      for (let i = 0; i < result.indexes.length; i++) {
        lots.push({
          amount: tronWebInstance.fromSun(result.amounts[i]),
          expiryDate: new Date(result.expiries[i] * 1000).toLocaleString(),
        });
      }

      setLots(lots);
    } catch (err) {
      console.error("Error fetching token lots:", err);
      setLots([]);
    }
  };

  const checkOtherBalance = async () => {
    if (!tronWeb || !checkAddress) return;
    try {
      await fetchTokenLots(checkAddress, setCheckedTokenLots, tronWeb);
      setCheckedBalance(null);
    } catch {
      alert("Could not fetch token lots. Make sure address is valid.");
    }
  };

  return (
    <div className="container">
      <h1>USDTF Token Viewer</h1>
      <p>
        <strong>Smart Contract Address:</strong> {CONTRACT_ADDRESS}
      </p>
      <p>
        <strong>Project:</strong> USDTF - TRON-based token for educational purposes
      </p>

      {walletAddress ? (
        <>
          <p>
            <strong>Connected Wallet:</strong> {walletAddress}
          </p>
          <p>
            <strong>Token Name:</strong> {tokenName}
          </p>
          <p>
            <strong>Symbol:</strong> {tokenSymbol}
          </p>
          <p>
            <strong>Your Balance:</strong> {balance} {tokenSymbol}
          </p>
          <p>
            <strong>Your Token Lots:</strong>
          </p>
          {tokenLots.length > 0 ? (
            <ul>
              {tokenLots.map(({ amount, expiryDate }, idx) => (
                <li key={idx}>
                  Amount: {amount} — Expires: {expiryDate}
                </li>
              ))}
            </ul>
          ) : (
            <p>No token lots found.</p>
          )}
        </>
      ) : (
        <p>Please connect TronLink wallet.</p>
      )}

      <h2>Check Token Lots by Address</h2>
      <input
        type="text"
        placeholder="Enter TRON wallet address"
        value={checkAddress}
        onChange={(e) => setCheckAddress(e.target.value)}
      />
      <button onClick={checkOtherBalance}>Check Token Lots</button>

      {checkedTokenLots.length > 0 && (
        <>
          <p>
            <strong>Token Lots for {checkAddress}:</strong>
          </p>
          <ul>
            {checkedTokenLots.map(({ amount, expiryDate }, idx) => (
              <li key={idx}>
                Amount: {amount} — Expires: {expiryDate}
              </li>
            ))}
          </ul>
        </>
      )}

      <footer>
        <hr />
        <p>
          <a href="https://trotok-sud.github.io/USDTWeb" target="_blank" rel="noreferrer">
            Official Website
          </a>{" "}
          |{" "}
          <a href="https://github.com/trotok-sud/USDTF" target="_blank" rel="noreferrer">
            Source Code
          </a>{" "}
          |{" "}
          <a
            href="https://github.com/trotok-sud/USDTF/blob/main/docs/Usdtf%20Audit%20Report.pdf"
            target="_blank"
            rel="noreferrer"
          >
            Audit Report
          </a>
        </p>
        <p>&copy; 2025 USDTF Token. Educational Use Only.</p>
      </footer>
    </div>
  );
}

export default App;
