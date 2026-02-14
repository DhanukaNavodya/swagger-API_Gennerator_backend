const mongoose = require('mongoose');

const endpointSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  path: {
    type: String,
    required: [true, 'Path is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return v.startsWith('/');
      },
      message: 'Path must start with /'
    }
  },
  method: {
    type: String,
    enum: {
      values: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
      message: '{VALUE} is not a valid HTTP method'
    },
    required: [true, 'HTTP method is required'],
    uppercase: true
  },
  summary: {
    type: String,
    required: [true, 'Summary is required'],
    maxlength: 200
  },
  description: {
    type: String,
    default: '',
    maxlength: 1000
  },
  tags: {
    type: [String],
    lowercase: true,
    trim: true
  },
  parameters: {
    type: [Object],
    default: []
  },
  requestBody: {
    type: Object,
    default: {}
  },
  responses: {
    type: [Object],
    default: []
  },
  security: {
    type: [String],
    enum: ['bearerAuth', 'apiKey', 'oauth2'],
    default: ['bearerAuth']
  },
  deprecated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Endpoint', endpointSchema);