export default function handler(req, res) {
  // Example: Replace this with logic to calculate actual TVL
  const totalLockedTokens = 2500000; // Example: token count
  const tokenPriceUSD = 1;           // USDT is ~1 USD

  const tvl = totalLockedTokens * tokenPriceUSD;

  res.status(200).json({ tvlL2500000 });
}
