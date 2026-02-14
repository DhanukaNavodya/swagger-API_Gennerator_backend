require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (no /api prefix)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/endpoints', require('./routes/endpointRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Serve Swagger UI for specific projects (CORRECTED VERSION)
app.use('/api-docs/:projectId', (req, res, next) => {
  const projectId = req.params.projectId;
  const filePath = path.join(__dirname, 'swagger-files', `${projectId}.json`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Swagger File Not Found</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
          .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 5px; }
          code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
          a { color: #1976d2; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>⚠️ Swagger File Not Found</h1>
          <p><strong>Project ID:</strong> ${projectId}</p>
          <p>Please generate the Swagger file first by making a GET request to:</p>
          <code>GET /projects/${projectId}/swagger</code>
          <p style="margin-top: 20px;">
            <strong>Steps:</strong><br>
            1. Login to get your token<br>
            2. Call: <code>GET http://localhost:${PORT}/projects/${projectId}/swagger</code><br>
            3. Include header: <code>Authorization: Bearer YOUR_TOKEN</code><br>
            4. Then refresh this page
          </p>
          <p style="margin-top: 30px;">
            <a href="http://localhost:${PORT}">← Back to API Home</a>
          </p>
        </div>
      </body>
      </html>
    `);
  }
  next();
},
swaggerUi.serve,
(req, res, next) => {
  const projectId = req.params.projectId;
  swaggerUi.setup(null, {
    swaggerOptions: {
      url: `/swagger-files/${projectId}`
    },
    customSiteTitle: 'Swagger Manager - API Documentation',
    customfavIcon: 'https://swagger.io/favicon-32x32.png',
    customCss: '.swagger-ui .topbar { display: none; } .swagger-ui .info .title small { display: none; }'
  })(req, res, next);
}
);

// Serve Swagger JSON files
app.use('/swagger-files/:projectId', (req, res) => {
  const filePath = path.join(__dirname, 'swagger-files', `${req.params.projectId}.json`);
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(filePath);
  } else {
    res.status(404).json({ 
      message: 'Swagger file not found',
      hint: 'Please generate it first by calling GET /projects/:id/swagger'
    });
  }
});

// Test routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Swagger Manager API is running! ✅',
    database: 'Connected to MongoDB Atlas',
    timestamp: new Date().toISOString(),
    apiEndpoints: {
      auth: {
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        me: 'GET /auth/me'
      },
      projects: {
        getAll: 'GET /projects',
        create: 'POST /projects',
        getById: 'GET /projects/:id',
        update: 'PUT /projects/:id',
        delete: 'DELETE /projects/:id',
        generateSwagger: 'GET /projects/:id/swagger',
        getSwaggerUrl: 'GET /projects/:id/swagger-url'
      },
      endpoints: {
        create: 'POST /endpoints',
        getByProject: 'GET /endpoints/project/:projectId',
        getById: 'GET /endpoints/:id',
        update: 'PUT /endpoints/:id',
        delete: 'DELETE /endpoints/:id'
      },
      swagger: {
        viewUI: 'GET /api-docs/:projectId (browser)',
        getJSON: 'GET /swagger-files/:projectId'
      }
    },
    note: 'All /api/projects and /api/endpoints routes require authentication token'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: 'Connected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Base URL: http://localhost:${PORT}`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/auth`);
  console.log(`📦 Projects API: http://localhost:${PORT}/projects`);
  console.log(`🔌 Endpoints API: http://localhost:${PORT}/endpoints`);
  console.log(`📄 Swagger JSON: http://localhost:${PORT}/swagger-files/{projectId}`);
  console.log(`🎨 Swagger UI: http://localhost:${PORT}/api-docs/{projectId}\n`);
});