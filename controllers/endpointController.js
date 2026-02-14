const Endpoint = require('../models/Endpoint');
const Project = require('../models/Project');
const SwaggerGenerator = require('../swagger/swaggerGenerator');

// @desc    Create new endpoint
// @route   POST /api/endpoints
// @access  Private
exports.createEndpoint = async (req, res) => {
  try {
    const { 
      projectId, 
      path, 
      method, 
      summary, 
      description, 
      tags, 
      parameters, 
      requestBody, 
      responses, 
      security,
      deprecated 
    } = req.body;
    
    // Validation
    if (!projectId || !path || !method || !summary) {
      return res.status(400).json({ 
        message: 'Project ID, path, method, and summary are required' 
      });
    }

    // Verify project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const hasAccess = 
      project.createdBy.toString() === req.user.id || 
      project.teamMembers.includes(req.user.id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this project' });
    }

    // Create endpoint
    const endpoint = new Endpoint({
      projectId,
      path,
      method,
      summary,
      description: description || '',
      tags: tags || ['default'],
      parameters: parameters || [],
      requestBody: requestBody || null,
      responses: responses || new Map([['200', { description: 'Successful response' }]]),
      security: security || ['bearerAuth'],
      deprecated: deprecated || false
    });

    await endpoint.save();

    // Add endpoint to project
    project.endpoints.push(endpoint._id);
    await project.save();

    // Regenerate swagger file
    const endpoints = await Endpoint.find({ projectId });
    const swaggerJson = SwaggerGenerator.generateSwaggerJson(project, endpoints);
    SwaggerGenerator.saveSwaggerFile(projectId, swaggerJson);

    res.status(201).json({
      _id: endpoint._id,
      path: endpoint.path,
      method: endpoint.method,
      summary: endpoint.summary,
      tags: endpoint.tags
    });
  } catch (error) {
    console.error('Create endpoint error:', error);
    res.status(500).json({ message: 'Server error creating endpoint' });
  }
};

// @desc    Get all endpoints for a project
// @route   GET /api/endpoints/project/:projectId
// @access  Private
exports.getEndpointsByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access
    const hasAccess = 
      project.createdBy.toString() === req.user.id || 
      project.teamMembers.includes(req.user.id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this project' });
    }

    const endpoints = await Endpoint.find({ projectId: req.params.projectId })
      .sort({ createdAt: -1 });

    res.json(endpoints);
  } catch (error) {
    console.error('Get endpoints error:', error);
    res.status(500).json({ message: 'Server error fetching endpoints' });
  }
};

// @desc    Get single endpoint by ID
// @route   GET /api/endpoints/:id
// @access  Private
exports.getEndpointById = async (req, res) => {
  try {
    const endpoint = await Endpoint.findById(req.params.id);
    if (!endpoint) {
      return res.status(404).json({ message: 'Endpoint not found' });
    }

    // Verify user has access to the project
    const project = await Project.findById(endpoint.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const hasAccess = 
      project.createdBy.toString() === req.user.id || 
      project.teamMembers.includes(req.user.id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(endpoint);
  } catch (error) {
    console.error('Get endpoint error:', error);
    res.status(500).json({ message: 'Server error fetching endpoint' });
  }
};

// @desc    Update endpoint
// @route   PUT /api/endpoints/:id
// @access  Private
exports.updateEndpoint = async (req, res) => {
  try {
    const { 
      path, 
      method, 
      summary, 
      description, 
      tags, 
      parameters, 
      requestBody, 
      responses, 
      security,
      deprecated 
    } = req.body;
    
    const endpoint = await Endpoint.findById(req.params.id);
    if (!endpoint) {
      return res.status(404).json({ message: 'Endpoint not found' });
    }

    // Verify user has access to the project
    const project = await Project.findById(endpoint.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const hasAccess = 
      project.createdBy.toString() === req.user.id || 
      project.teamMembers.includes(req.user.id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update fields
    if (path) endpoint.path = path;
    if (method) endpoint.method = method;
    if (summary) endpoint.summary = summary;
    if (description !== undefined) endpoint.description = description;
    if (tags) endpoint.tags = tags;
    if (parameters) endpoint.parameters = parameters;
    if (requestBody) endpoint.requestBody = requestBody;
    if (responses) endpoint.responses = responses;
    if (security) endpoint.security = security;
    if (deprecated !== undefined) endpoint.deprecated = deprecated;

    endpoint.updatedAt = Date.now();
    await endpoint.save();

    // Regenerate swagger file
    const endpoints = await Endpoint.find({ projectId: endpoint.projectId });
    const swaggerJson = SwaggerGenerator.generateSwaggerJson(project, endpoints);
    SwaggerGenerator.saveSwaggerFile(endpoint.projectId, swaggerJson);

    res.json(endpoint);
  } catch (error) {
    console.error('Update endpoint error:', error);
    res.status(500).json({ message: 'Server error updating endpoint' });
  }
};

// @desc    Delete endpoint
// @route   DELETE /api/endpoints/:id
// @access  Private
exports.deleteEndpoint = async (req, res) => {
  try {
    const endpoint = await Endpoint.findById(req.params.id);
    if (!endpoint) {
      return res.status(404).json({ message: 'Endpoint not found' });
    }

    // Verify user has access to the project
    const project = await Project.findById(endpoint.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const hasAccess = 
      project.createdBy.toString() === req.user.id || 
      project.teamMembers.includes(req.user.id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove from project
    project.endpoints = project.endpoints.filter(
      epId => epId.toString() !== req.params.id
    );
    await project.save();

    // Delete endpoint
    await Endpoint.findByIdAndDelete(req.params.id);

    // Regenerate swagger file
    const endpoints = await Endpoint.find({ projectId: endpoint.projectId });
    const swaggerJson = SwaggerGenerator.generateSwaggerJson(project, endpoints);
    SwaggerGenerator.saveSwaggerFile(endpoint.projectId, swaggerJson);

    res.json({ message: 'Endpoint deleted successfully' });
  } catch (error) {
    console.error('Delete endpoint error:', error);
    res.status(500).json({ message: 'Server error deleting endpoint' });
  }
};