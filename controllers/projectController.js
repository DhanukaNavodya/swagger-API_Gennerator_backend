const Project = require('../models/Project');
const Endpoint = require('../models/Endpoint');
const SwaggerGenerator = require('../swagger/swaggerGenerator');

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validation
    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = new Project({
      name,
      description: description || '',
      createdBy: req.user.id,
      teamMembers: [req.user.id]
    });

    await project.save();
    
    res.status(201).json({
      _id: project._id,
      name: project.name,
      description: project.description,
      createdBy: project.createdBy,
      teamMembers: project.teamMembers,
      createdAt: project.createdAt
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error creating project' });
  }
};

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ 
      $or: [
        { createdBy: req.user.id },
        { teamMembers: req.user.id }
      ]
    })
    .populate('createdBy', 'username email')
    .populate('teamMembers', 'username email')
    .sort({ createdAt: -1 });
    
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error fetching projects' });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('teamMembers', 'username email')
      .populate('endpoints');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access
    const hasAccess = 
      project.createdBy._id.toString() === req.user.id || 
      project.teamMembers.some(member => member._id.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this project' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error fetching project' });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    const { name, description, teamMembers } = req.body;
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check ownership
    if (project.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only project owner can update' });
    }

    // Update fields
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (teamMembers) project.teamMembers = teamMembers;

    await project.save();

    res.json({
      _id: project._id,
      name: project.name,
      description: project.description,
      teamMembers: project.teamMembers
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error updating project' });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check ownership
    if (project.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only project owner can delete' });
    }

    // Delete associated endpoints
    await Endpoint.deleteMany({ projectId: req.params.id });
    
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error deleting project' });
  }
};

// @desc    Get Swagger specification for a project
// @route   GET /api/projects/:id/swagger
// @access  Private
exports.getProjectSwagger = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access
    // const hasAccess = 
    //   project.createdBy.toString() === req.user.id || 
    //   project.teamMembers.includes(req.user.id);

    // if (!hasAccess) {
    //   return res.status(403).json({ message: 'Access denied' });
    // }

    // Get all endpoints for this project
    const endpoints = await Endpoint.find({ projectId: req.params.id });

    // Generate Swagger JSON
    const swaggerJson = SwaggerGenerator.generateSwaggerJson(project, endpoints);
    
    // Save swagger file
    SwaggerGenerator.saveSwaggerFile(req.params.id, swaggerJson);
    
    res.json(swaggerJson);
  } catch (error) {
    console.error('Get Swagger error:', error);
    res.status(500).json({ message: 'Server error generating Swagger' });
  }
};

// @desc    Get Swagger file URL
// @route   GET /api/projects/:id/swagger-url
// @access  Private
exports.getSwaggerUrl = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access
    const hasAccess = 
      project.createdBy.toString() === req.user.id || 
      project.teamMembers.includes(req.user.id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      swaggerUrl: `http://localhost:${process.env.PORT || 5000}/swagger-files/${req.params.id}`
    });
  } catch (error) {
    console.error('Get Swagger URL error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};