/**
 * @typedef {Object} PurchasedPackage
 * @property {string} id - Package ID ("starter" | "pro" | "elite")
 * @property {string} name - Display name of the package
 * @property {"active" | "inactive"} status - Package status
 * @property {string} [description] - Optional package description
 * @property {string[]} [features] - Optional list of features
 */

/**
 * @typedef {Object} Platform
 * @property {string} id - Platform ID ("binance" | "okx" | "coinbase" | "airdrops" | etc.)
 * @property {string} name - Display name of the platform
 * @property {string} [blurb] - Optional short description
 * @property {"easy" | "medium" | "hard"} [difficulty] - Difficulty level
 * @property {number} [estTimeMins] - Estimated time in minutes
 * @property {string} [externalUrl] - Optional external URL
 * @property {StepItem[]} [steps] - List of steps for this platform
 */

/**
 * @typedef {Object} StepItem
 * @property {string} id - Step ID
 * @property {string} title - Step title
 * @property {string} [detail] - Optional step detail/description
 */

export {}; // Make this a module
