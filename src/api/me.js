import api from '../services/api';

/**
 * Mock data for development/fallback
 */
const MOCK_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Package',
    status: 'active',
    description: 'Get started with basic crypto opportunities and foundational strategies.',
    features: ['Basic Airdrops', 'Simple Staking', 'Exchange Setup']
  },
  {
    id: 'pro',
    name: 'Pro Package', 
    status: 'active',
    description: 'Advanced strategies and premium opportunities for serious crypto enthusiasts.',
    features: ['Premium Airdrops', 'Advanced DeFi', 'MEV Strategies', 'Professional Trading']
  },
  {
    id: 'elite',
    name: 'Elite Package',
    status: 'active', 
    description: 'Exclusive access to high-value opportunities and cutting-edge strategies.',
    features: ['Exclusive Alpha', 'Institutional Access', 'Private Deals', 'Advanced Analytics']
  }
];

const MOCK_PLATFORMS = {
  starter: [
    {
      id: 'airdrops-basic',
      name: 'Basic Airdrops',
      blurb: 'Learn to claim free tokens and participate in airdrops safely',
      difficulty: 'easy',
      estTimeMins: 30,
      externalUrl: 'https://airdrop.io',
      steps: [
        { id: '1', title: 'Set up a dedicated wallet', detail: 'Create a separate wallet for airdrop activities' },
        { id: '2', title: 'Research active airdrops', detail: 'Find legitimate airdrop opportunities' },
        { id: '3', title: 'Complete basic tasks', detail: 'Follow, retweet, and join communities' },
        { id: '4', title: 'Claim your rewards', detail: 'Follow instructions to claim tokens' }
      ]
    },
    {
      id: 'binance-setup',
      name: 'Binance Exchange',
      blurb: 'Set up and verify your Binance account for trading',
      difficulty: 'easy',
      estTimeMins: 45,
      externalUrl: 'https://binance.com',
      steps: [
        { id: '1', title: 'Create Binance account', detail: 'Sign up with email and secure password' },
        { id: '2', title: 'Complete KYC verification', detail: 'Upload ID documents for verification' },
        { id: '3', title: 'Enable 2FA security', detail: 'Set up Google Authenticator or SMS 2FA' },
        { id: '4', title: 'Make your first deposit', detail: 'Fund your account via bank transfer or crypto' },
        { id: '5', title: 'Place your first trade', detail: 'Start with spot trading basics' }
      ]
    },
    {
      id: 'staking-basic',
      name: 'Basic Staking',
      blurb: 'Earn passive income by staking popular cryptocurrencies',
      difficulty: 'easy',
      estTimeMins: 20,
      steps: [
        { id: '1', title: 'Choose staking platform', detail: 'Select a reputable staking service' },
        { id: '2', title: 'Select coins to stake', detail: 'Research staking rewards and lock periods' },
        { id: '3', title: 'Start staking', detail: 'Delegate or stake your tokens' },
        { id: '4', title: 'Monitor rewards', detail: 'Track your staking earnings' }
      ]
    }
  ],
  pro: [
    {
      id: 'defi-advanced',
      name: 'Advanced DeFi',
      blurb: 'Explore yield farming, liquidity provision, and complex DeFi strategies',
      difficulty: 'hard',
      estTimeMins: 90,
      steps: [
        { id: '1', title: 'Understand impermanent loss', detail: 'Learn the risks of providing liquidity' },
        { id: '2', title: 'Research yield farms', detail: 'Find high-APY farming opportunities' },
        { id: '3', title: 'Provide liquidity', detail: 'Add tokens to liquidity pools' },
        { id: '4', title: 'Compound rewards', detail: 'Reinvest earnings for compound growth' },
        { id: '5', title: 'Monitor and adjust', detail: 'Regularly review and optimize positions' }
      ]
    },
    {
      id: 'mev-strategies',
      name: 'MEV Strategies',
      blurb: 'Learn Maximum Extractable Value techniques for advanced profits',
      difficulty: 'hard',
      estTimeMins: 120,
      steps: [
        { id: '1', title: 'Understand MEV basics', detail: 'Learn about front-running and arbitrage' },
        { id: '2', title: 'Set up MEV tools', detail: 'Install and configure MEV bots' },
        { id: '3', title: 'Practice on testnets', detail: 'Test strategies without risk' },
        { id: '4', title: 'Deploy live strategies', detail: 'Execute MEV strategies on mainnet' }
      ]
    },
    {
      id: 'premium-airdrops',
      name: 'Premium Airdrops',
      blurb: 'Access exclusive airdrop opportunities with higher rewards',
      difficulty: 'medium',
      estTimeMins: 60,
      steps: [
        { id: '1', title: 'Join premium communities', detail: 'Access exclusive airdrop channels' },
        { id: '2', title: 'Complete advanced tasks', detail: 'Participate in governance and testing' },
        { id: '3', title: 'Maintain activity', detail: 'Stay engaged with protocols long-term' },
        { id: '4', title: 'Track allocations', detail: 'Monitor your airdrop eligibility' }
      ]
    }
  ],
  elite: [
    {
      id: 'institutional-access',
      name: 'Institutional Access',
      blurb: 'Gain access to institutional-grade trading and investment opportunities',
      difficulty: 'hard',
      estTimeMins: 180,
      steps: [
        { id: '1', title: 'Meet minimum requirements', detail: 'Ensure you qualify for institutional access' },
        { id: '2', title: 'Complete enhanced KYC', detail: 'Provide additional verification documents' },
        { id: '3', title: 'Access institutional platforms', detail: 'Get whitelisted for exclusive platforms' },
        { id: '4', title: 'Execute large trades', detail: 'Use institutional liquidity and pricing' }
      ]
    },
    {
      id: 'private-deals',
      name: 'Private Deals',
      blurb: 'Participate in exclusive private sales and investment rounds',
      difficulty: 'hard',
      estTimeMins: 240,
      steps: [
        { id: '1', title: 'Build network connections', detail: 'Connect with VCs and project teams' },
        { id: '2', title: 'Get deal flow access', detail: 'Join exclusive investor groups' },
        { id: '3', title: 'Due diligence process', detail: 'Evaluate investment opportunities' },
        { id: '4', title: 'Participate in rounds', detail: 'Invest in private sales and rounds' }
      ]
    },
    {
      id: 'exclusive-alpha',
      name: 'Exclusive Alpha',
      blurb: 'Access to insider information and market-moving insights',
      difficulty: 'medium',
      estTimeMins: 90,
      steps: [
        { id: '1', title: 'Join alpha groups', detail: 'Access exclusive information channels' },
        { id: '2', title: 'Verify alpha sources', detail: 'Learn to identify reliable information' },
        { id: '3', title: 'Act on opportunities', detail: 'Execute trades based on alpha' },
        { id: '4', title: 'Build reputation', detail: 'Contribute to the community' }
      ]
    }
  ]
};

/**
 * Utility to handle API calls with mock fallback
 */
async function withMock(apiCall, mockData) {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    if (error.response?.status === 404 || error.code === 'ECONNREFUSED') {
      console.log('🔧 API endpoint not available, using mock data');
      return mockData;
    }
    throw error;
  }
}

/**
 * Get user's purchased packages
 * @returns {Promise<import('../types/packages').PurchasedPackage[]>}
 */
export async function getMyPackages() {
  return withMock(
    () => api.get('/me/packages'),
    MOCK_PACKAGES
  );
}

/**
 * Get platforms for a specific package
 * @param {string} packageId - Package ID
 * @returns {Promise<import('../types/packages').Platform[]>}
 */
export async function getPackagePlatforms(packageId) {
  return withMock(
    () => api.get(`/packages/${packageId}/platforms`),
    MOCK_PLATFORMS[packageId] || []
  );
}

/**
 * Get detailed guide for a specific platform
 * @param {string} packageId - Package ID
 * @param {string} platformId - Platform ID
 * @returns {Promise<import('../types/packages').Platform>}
 */
export async function getPlatformGuide(packageId, platformId) {
  return withMock(
    () => api.get(`/packages/${packageId}/platforms/${platformId}`),
    MOCK_PLATFORMS[packageId]?.find(p => p.id === platformId) || null
  );
}
