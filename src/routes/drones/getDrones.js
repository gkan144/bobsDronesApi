const express = require('express');
const apiClient = require('../../lib/api/apiClient');

const router = express.Router();

router.get('/', async (req, res) => {
  console.log('*** Received request for /drones');
  try {
    const { fromCache, drones } = await apiClient.getAllDrones();
    if (fromCache && drones === null) {
      console.log('*** Failed pulling from cache for drones info.');
      res.status(502).send('Bad Gateway');
    } else {
      console.log('*** Responding with drones info.');
      res.json(drones);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
