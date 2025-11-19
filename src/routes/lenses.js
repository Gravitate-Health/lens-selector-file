const express = require('express');
const { getLensByName, getLensNames } = require('../services/lensService');

const router = express.Router();

/**
 * GET /lenses
 * Returns a list of all available lens IDs/names
 */
router.get('/', (req, res, next) => {
  try {
    const lensNames = getLensNames(req.app.locals.lenses);

    res.status(200).json(lensNames);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /lenses/:name
 * Returns the complete lens definition with all fields including base64 content
 */
router.get('/:name', (req, res, next) => {
  try {
    const { name } = req.params;

    // Get the lens from the loaded lenses
    const lens = getLensByName(req.app.locals.lenses, name);

    if (!lens) {
      const error = new Error(`Lens '${name}' not found`);
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json(lens);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
