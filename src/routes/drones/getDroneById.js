const express = require('express');
const apiClient = require('../../lib/api/apiClient');

const router = express.Router();

router.get('/:droneId', async (req, res) => {
  const { droneId } = req.params;
  console.log(`*** Received request for /drones/${droneId}`);
  try {
    const {
      fromCache, drone, errorCode, errorMessage,
    } = await apiClient.getDroneById(droneId);
    if (errorCode && errorMessage) {
      console.log(`Error in getting drone by id: ${errorCode} - ${errorMessage}`);
      res.status(errorCode).send(errorMessage);
    } else if (fromCache && drone === null) {
      console.log(`*** Failed pulling from cache for drone ${droneId} info.`);
      res.status(502).send('Bad Gateway');
    } else {
      console.log(`*** Responding with drone ${droneId} info.`);
      res.json(drone);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
