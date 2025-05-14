/**
 * Proxy rotation utility for Crawlee
 */

// List of proxy servers (to be populated from environment variables or config)
// In a real implementation, these would be loaded from a secure source
const PROXIES = [
  // Example format: 'http://username:password@proxy.example.com:8080'
];

/**
 * Get a random proxy from the list
 * @returns {string|null} Random proxy or null if no proxies are available
 */
function getRandomProxy() {
  if (PROXIES.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * PROXIES.length);
  return PROXIES[randomIndex];
}

module.exports = {
  getRandomProxy,
};
