const fs = require('fs');
const path = require('path');

/**
 * Gets a specific lens by name
 * @param {Object[]} lenses - Array of loaded lenses
 * @param {string} name - The name of the lens to retrieve
 * @returns {Object|null} - The lens object or null if not found
 */
function getLensByName(lenses, name) {
  return lenses.find((lens) => lens.name === name) || null;
}

/**
 * Gets all lens names/IDs
 * @param {Object[]} lenses - Array of loaded lenses
 * @returns {string[]} - Array of lens names
 */
function getLensNames(lenses) {
  return lenses.map((lens) => lens.name).sort();
}

module.exports = {
  getLensByName,
  getLensNames
};
