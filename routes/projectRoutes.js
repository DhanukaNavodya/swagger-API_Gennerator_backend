const express = require('express');
const router = express.Router();
const { 
  createProject, 
  getProjects, 
  getProjectById, 
  updateProject, 
  deleteProject,
  getProjectSwagger,
  getSwaggerUrl
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createProject);
router.get('/', protect, getProjects);
router.get('/:id', protect, getProjectById);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);
router.get('/:id/swagger', getProjectSwagger);
router.get('/:id/swagger-url', protect, getSwaggerUrl);

module.exports = router;