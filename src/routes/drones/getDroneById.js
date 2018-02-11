const express = require('express');
const apiClient = require('../../lib/api/apiClient');

const router = express.Router();

router.get('/:droneId', async (req, res) => {
  try {
    const {
      fromCache, drone, errorCode, errorMessage,
    } = await apiClient.getDroneById(req.params.droneId);
    if (errorCode && errorMessage) {
      res.status(errorCode).send(errorMessage);
    } else if (fromCache && drone === null) {
      res.status(502).send('Bad Gateway');
    } else {
      res.json(drone);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
