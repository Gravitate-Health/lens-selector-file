const fs = require('fs');
const path = require('path');

/**
 * Validates that a lens conforms to FHIR Lens profile requirements
 * @param {Object} lens - The lens object to validate
 * @param {string} filePath - Path to the lens file (for error reporting)
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
function validateLens(lens, filePath) {
  const errors = [];

  // Check if lens is a valid object
  if (!lens || typeof lens !== 'object') {
    errors.push('Lens is not a valid JSON object');
    return { isValid: false, errors };
  }

  // Validate resourceType is Library
  if (lens.resourceType !== 'Library') {
    errors.push(`Invalid resourceType: expected 'Library', got '${lens.resourceType || 'undefined'}'`);
  }

  // Validate required FHIR fields
  if (!lens.name || typeof lens.name !== 'string') {
    errors.push('Missing or invalid name field (required)');
  }

  if (!lens.id || typeof lens.id !== 'string') {
    errors.push('Missing or invalid id field (required)');
  }

  if (lens.status && !['draft', 'active', 'retired', 'unknown'].includes(lens.status)) {
    errors.push(`Invalid status value: ${lens.status}`);
  }

  // Validate content is present and contains base64 data
  if (!Array.isArray(lens.content) || lens.content.length === 0) {
    errors.push('Missing or empty content array (required for FHIR Lens)');
  } else {
    // Check that content items have data
    lens.content.forEach((item, index) => {
      if (!item.data || typeof item.data !== 'string') {
        errors.push(`Content item ${index} missing base64 data field`);
      }
    });
  }

  // Validate extension for Lens profile (optional but recommended)
  if (lens.extension && !Array.isArray(lens.extension)) {
    errors.push('Extension field must be an array');
  }

  // Validate type field (should reference Lens concept)
  if (!lens.type) {
    errors.push('Missing type field (should reference Lens concept)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Discovers all lens files in the specified folder
 * @param {string} lensesFolder - Path to the lenses folder
 * @returns {Promise<Object[]>} - Array of lens objects
 */
async function discoverLenses(lensesFolder) {
  const lenses = [];
  const validationErrors = {};

  try {
    // Check if folder exists
    if (!fs.existsSync(lensesFolder)) {
      console.warn(`Lenses folder does not exist: ${lensesFolder}`);
      return { lenses: [], validationErrors };
    }

    // Read all files in the folder
    const files = fs.readdirSync(lensesFolder);

    for (const file of files) {
      // Only process JSON files
      if (!file.endsWith('.json')) {
        continue;
      }

      const filePath = path.join(lensesFolder, file);
      const stat = fs.statSync(filePath);

      // Skip directories
      if (stat.isDirectory()) {
        continue;
      }

      try {
        // Read and parse the lens file
        const content = fs.readFileSync(filePath, 'utf-8');
        const lens = JSON.parse(content);

        // Validate the lens
        const validation = validateLens(lens, filePath);

        if (validation.isValid) {
          lenses.push(lens);
        } else {
          validationErrors[file] = validation.errors;
          console.warn(`Lens file validation failed: ${file}`, validation.errors);
        }
      } catch (error) {
        validationErrors[file] = [`Failed to parse JSON: ${error.message}`];
        console.error(`Error processing lens file ${file}:`, error.message);
      }
    }

    console.log(`Successfully loaded ${lenses.length} lens(es) from ${lensesFolder}`);
    if (Object.keys(validationErrors).length > 0) {
      console.warn(
        `${Object.keys(validationErrors).length} lens file(s) failed validation`
      );
    }

    return { lenses, validationErrors };
  } catch (error) {
    console.error(`Error discovering lenses in ${lensesFolder}:`, error.message);
    throw new Error(`Failed to discover lenses: ${error.message}`);
  }
}

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
  discoverLenses,
  getLensByName,
  getLensNames,
  validateLens,
};
