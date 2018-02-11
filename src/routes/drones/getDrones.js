const express = require('express');
const apiClient = require('../../lib/api/apiClient');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { fromCache, drones } = await apiClient.getAllDrones();
    if (fromCache && drones === null) {
      res.status(502).send('Bad Gateway');
    } else {
      res.json(drones);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
