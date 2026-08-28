const os = require('os');

/**
 * Get the system's IP address (non-internal)
 * @returns {string} The system's IP address
 */
function getSystemIP() {
  const interfaces = os.networkInterfaces();
  let systemIP = 'localhost';

  // Iterate through network interfaces
  for (const interfaceName in interfaces) {
    const interfaceInfo = interfaces[interfaceName];

    // Find the first non-internal IPv4 address
    for (const info of interfaceInfo) {
      if (info.family === 'IPv4' && !info.internal) {
        systemIP = info.address;
        break;
      }
    }

    if (systemIP !== 'localhost') break;
  }

  return systemIP;
}

module.exports = getSystemIP;