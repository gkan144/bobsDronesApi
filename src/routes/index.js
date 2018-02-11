const express = require('express');
const droneRoutes = require('./drones');

const router = express.Router();
router.use(droneRoutes);

module.exports = router;
