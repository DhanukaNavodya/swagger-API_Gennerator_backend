const express = require('express');
const router = express.Router();
const { 
  createEndpoint, 
  getEndpointsByProject, 
  getEndpointById, 
  updateEndpoint, 
  deleteEndpoint 
} = require('../controllers/endpointController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createEndpoint);
router.get('/project/:projectId', protect, getEndpointsByProject);
router.get('/:id', protect, getEndpointById);
router.put('/:id', protect, updateEndpoint);
router.delete('/:id', protect, deleteEndpoint);

module.exports = router;