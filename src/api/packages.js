import api from '../services/api.js';

/**
 * Utility function to mock API responses when endpoints are not available
 * @param {Function} apiCall - The API call function
 * @param {any} mockData - Mock data to return on error
 * @returns {Promise<any>} - API response or mock data
 */
async function withMock(apiCall, mockData) {
  console.log('🔍 withMock called with mockData:', mockData);
  try {
    const response = await apiCall();
    console.log('✅ API call succeeded:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ API call failed, returning mock data:', error.message);
    console.log('🔍 Mock data being returned:', mockData);
    return mockData;
  }
}

/**
 * Get user's purchased packages
 * @returns {Promise<import('../types/packages.js').PurchasedPackage[]>}
 */
export async function getMyPackages() {
  const mockPackages = [
    {
      id: 'starter',
      name: 'Starter',
      status: 'active',
      description: 'Essential tools to get started in crypto',
      features: ['Basic airdrops', 'Simple exchanges', 'Beginner guides']
    },
    {
      id: 'pro',
      name: 'Pro',
      status: 'active',
      description: 'Advanced strategies and premium platforms',
      features: ['Premium airdrops', 'Advanced trading', 'DeFi protocols', 'NFT opportunities']
    },
    {
      id: 'elite',
      name: 'Elite',
      status: 'active',
      description: 'Complete access to all platforms and strategies',
      features: ['All airdrops', 'Professional trading', 'Institutional DeFi', 'Early access opportunities']
    }
  ];

  return withMock(
    () => api.get('/me/packages'),
    mockPackages
  ).then(data => {
    // Transform backend data structure to our expected format
    return data.map(pkg => ({
      id: pkg.id || pkg.slug || pkg._id,
      name: pkg.name || pkg.title,
      status: pkg.status || 'active',
      description: pkg.description,
      features: pkg.features || [],
      ...pkg // Keep other properties
    }));
  });
}

/**
 * Get platforms available for a package
 * @param {string} packageId - Package ID
 * @returns {Promise<import('../types/packages.js').Platform[]>}
 */
export async function getPackagePlatforms(packageId) {
  const mockPlatforms = [
    {
      id: 'airdrops',
      name: 'Airdrops',
      blurb: 'Discover and claim free crypto airdrops',
      difficulty: 'easy',
      estTimeMins: 30,
      externalUrl: 'https://airdrops.io'
    },
    {
      id: 'binance',
      name: 'Binance',
      blurb: 'World\'s largest cryptocurrency exchange',
      difficulty: 'medium',
      estTimeMins: 45,
      externalUrl: 'https://binance.com'
    },
    {
      id: 'coinbase',
      name: 'Coinbase',
      blurb: 'User-friendly crypto exchange and wallet',
      difficulty: 'easy',
      estTimeMins: 25,
      externalUrl: 'https://coinbase.com'
    },
    {
      id: 'uniswap',
      name: 'Uniswap',
      blurb: 'Decentralized trading protocol',
      difficulty: 'hard',
      estTimeMins: 60,
      externalUrl: 'https://uniswap.org'
    },
    {
      id: 'metamask',
      name: 'MetaMask',
      blurb: 'Popular Ethereum wallet and gateway to DeFi',
      difficulty: 'medium',
      estTimeMins: 35,
      externalUrl: 'https://metamask.io'
    },
    {
      id: 'staking',
      name: 'Staking Rewards',
      blurb: 'Earn passive income by staking cryptocurrencies',
      difficulty: 'medium',
      estTimeMins: 40,
      externalUrl: 'https://stakerewards.com'
    }
  ];

  // Filter platforms based on package tier
  let filteredPlatforms = mockPlatforms;
  if (packageId === 'starter') {
    filteredPlatforms = mockPlatforms.filter(p => 
      ['airdrops', 'coinbase', 'metamask'].includes(p.id)
    );
  } else if (packageId === 'pro') {
    filteredPlatforms = mockPlatforms.filter(p => 
      !['uniswap'].includes(p.id) // Pro gets most but not the hardest ones
    );
  }
  // Elite gets all platforms

  return withMock(
    () => api.get(`/packages/${packageId}/platforms`),
    filteredPlatforms
  );
}

/**
 * Get detailed guide for a specific platform
 * @param {string} packageId - Package ID
 * @param {string} platformId - Platform ID
 * @returns {Promise<import('../types/packages.js').Platform>}
 */
export async function getPlatformGuide(packageId, platformId) {
  const mockGuides = {
    airdrops: {
      id: 'airdrops',
      name: 'Airdrops',
      blurb: 'Discover and claim free crypto airdrops',
      difficulty: 'easy',
      estTimeMins: 30,
      externalUrl: 'https://airdrops.io',
      steps: [
        { id: '1', title: 'Set up a dedicated airdrop wallet', detail: 'Create a separate wallet for airdrops to keep your main funds secure' },
        { id: '2', title: 'Join crypto communities', detail: 'Follow projects on Twitter, Discord, and Telegram for early announcements' },
        { id: '3', title: 'Complete social tasks', detail: 'Like, retweet, and share content as required by airdrop campaigns' },
        { id: '4', title: 'Verify your participation', detail: 'Submit wallet address and complete any verification steps' },
        { id: '5', title: 'Claim your tokens', detail: 'Follow instructions to claim tokens when the airdrop goes live' },
        { id: '6', title: 'Track your airdrops', detail: 'Keep a spreadsheet of all airdrops you\'ve participated in' }
      ]
    },
    binance: {
      id: 'binance',
      name: 'Binance',
      blurb: 'World\'s largest cryptocurrency exchange',
      difficulty: 'medium',
      estTimeMins: 45,
      externalUrl: 'https://binance.com',
      steps: [
        { id: '1', title: 'Create Binance account', detail: 'Sign up with email and complete email verification' },
        { id: '2', title: 'Complete KYC verification', detail: 'Upload government ID and complete identity verification' },
        { id: '3', title: 'Enable 2FA security', detail: 'Set up Google Authenticator or SMS for account security' },
        { id: '4', title: 'Deposit funds', detail: 'Transfer crypto or fiat money to your Binance account' },
        { id: '5', title: 'Learn the interface', detail: 'Familiarize yourself with spot trading, futures, and other features' },
        { id: '6', title: 'Make your first trade', detail: 'Start with small amounts and basic buy/sell orders' },
        { id: '7', title: 'Explore Binance Earn', detail: 'Check out staking, savings, and other earning opportunities' }
      ]
    },
    coinbase: {
      id: 'coinbase',
      name: 'Coinbase',
      blurb: 'User-friendly crypto exchange and wallet',
      difficulty: 'easy',
      estTimeMins: 25,
      externalUrl: 'https://coinbase.com',
      steps: [
        { id: '1', title: 'Sign up for Coinbase', detail: 'Create account with email and phone verification' },
        { id: '2', title: 'Verify your identity', detail: 'Upload ID and complete verification process' },
        { id: '3', title: 'Add payment method', detail: 'Link bank account or debit card for easy purchases' },
        { id: '4', title: 'Buy your first crypto', detail: 'Purchase Bitcoin or Ethereum to get started' },
        { id: '5', title: 'Set up Coinbase Wallet', detail: 'Download the separate wallet app for DeFi access' },
        { id: '6', title: 'Explore Coinbase Earn', detail: 'Complete educational tasks to earn free crypto' }
      ]
    },
    uniswap: {
      id: 'uniswap',
      name: 'Uniswap',
      blurb: 'Decentralized trading protocol',
      difficulty: 'hard',
      estTimeMins: 60,
      externalUrl: 'https://uniswap.org',
      steps: [
        { id: '1', title: 'Set up MetaMask wallet', detail: 'Install and configure MetaMask browser extension' },
        { id: '2', title: 'Get Ethereum for gas', detail: 'Ensure you have ETH to pay for transaction fees' },
        { id: '3', title: 'Connect to Uniswap', detail: 'Visit app.uniswap.org and connect your wallet' },
        { id: '4', title: 'Understand slippage', detail: 'Learn about slippage tolerance and price impact' },
        { id: '5', title: 'Make a test swap', detail: 'Start with a small amount to test the process' },
        { id: '6', title: 'Learn about liquidity pools', detail: 'Understand how AMMs work and liquidity provision' },
        { id: '7', title: 'Explore advanced features', detail: 'Learn about limit orders and concentrated liquidity' }
      ]
    },
    metamask: {
      id: 'metamask',
      name: 'MetaMask',
      blurb: 'Popular Ethereum wallet and gateway to DeFi',
      difficulty: 'medium',
      estTimeMins: 35,
      externalUrl: 'https://metamask.io',
      steps: [
        { id: '1', title: 'Install MetaMask extension', detail: 'Download from official website and add to browser' },
        { id: '2', title: 'Create a new wallet', detail: 'Generate new wallet and write down seed phrase securely' },
        { id: '3', title: 'Secure your seed phrase', detail: 'Store recovery phrase offline in multiple safe locations' },
        { id: '4', title: 'Add Ethereum to wallet', detail: 'Transfer ETH from exchange or buy directly in MetaMask' },
        { id: '5', title: 'Connect to a DeFi app', detail: 'Practice connecting to Uniswap or other DeFi protocols' },
        { id: '6', title: 'Add custom tokens', detail: 'Learn to add ERC-20 tokens to your wallet view' }
      ]
    },
    staking: {
      id: 'staking',
      name: 'Staking Rewards',
      blurb: 'Earn passive income by staking cryptocurrencies',
      difficulty: 'medium',
      estTimeMins: 40,
      externalUrl: 'https://stakerewards.com',
      steps: [
        { id: '1', title: 'Research staking options', detail: 'Compare different cryptocurrencies and their staking rewards' },
        { id: '2', title: 'Choose a staking platform', detail: 'Select between native staking, exchanges, or staking pools' },
        { id: '3', title: 'Understand lock-up periods', detail: 'Learn about unbonding periods and liquidity considerations' },
        { id: '4', title: 'Start with small amounts', detail: 'Begin staking with small amounts to test the process' },
        { id: '5', title: 'Monitor your rewards', detail: 'Track earnings and understand reward distribution schedules' },
        { id: '6', title: 'Compound your earnings', detail: 'Reinvest rewards to maximize long-term returns' }
      ]
    }
  };

  const mockGuide = mockGuides[platformId] || {
    id: platformId,
    name: platformId.charAt(0).toUpperCase() + platformId.slice(1),
    blurb: 'Platform guide coming soon',
    difficulty: 'medium',
    estTimeMins: 30,
    steps: [
      { id: '1', title: 'Getting started', detail: 'Basic setup and account creation' },
      { id: '2', title: 'Platform overview', detail: 'Understanding the platform features' },
      { id: '3', title: 'First steps', detail: 'Making your first transaction or interaction' },
      { id: '4', title: 'Advanced features', detail: 'Exploring more complex functionality' }
    ]
  };

  return withMock(
    () => api.get(`/packages/${packageId}/platforms/${platformId}`),
    mockGuide
  );
}
