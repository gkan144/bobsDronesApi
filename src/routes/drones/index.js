const express = require('express');
const getDronesRoute = require('./getDrones');
const getDroneByIdRoute = require('./getDroneById');

const router = express.Router();
router.use('/drones', getDronesRoute);
router.use('/drones', getDroneByIdRoute);

module.exports = router;
