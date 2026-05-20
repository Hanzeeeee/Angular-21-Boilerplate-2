import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import YAML from 'yamljs';
import path from 'path';

const router = express.Router();

const swaggerBaseUrl = process.env.BASE_URL || 'https://angular-21-boilerplate-2-1.onrender.com';

// swagger-jsdoc options – scan both source (.ts) during dev and compiled (.js) in dist for production
const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Node.js API', version: '1.0.0', description: 'API documentation' },
    servers: [
      { url: 'http://localhost:4000', description: 'Development server' },
      { url: swaggerBaseUrl, description: 'Production server' }
    ]
  },
  apis: [
    path.join(__dirname, '../../**/*.ts'),
    path.join(__dirname, '../../**/*.js'),
    path.join(__dirname, '../../../swagger.yaml')
  ]
};

let swaggerSpec: any;
try {
  swaggerSpec = swaggerJSDoc(options);
  // if swaggerSpec has no paths (e.g. no JSDoc present), fall back to static YAML
  if (!swaggerSpec || Object.keys(swaggerSpec.paths || {}).length === 0) {
    throw new Error('No JSDoc-generated paths found');
  }
} catch (err) {
  // try to load static YAML as a fallback
  try {
    swaggerSpec = YAML.load(path.join(__dirname, '../../../swagger.yaml'));
    swaggerSpec.servers = [
      { url: 'http://localhost:4000', description: 'Development server' },
      { url: swaggerBaseUrl, description: 'Production server' }
    ];
  } catch (yamlErr) {
    // last resort: minimal spec
    swaggerSpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      servers: [{ url: swaggerBaseUrl, description: 'Production server' }]
    };
  }
}

// additionally, try to merge paths/components from static YAML into JSDoc spec
try {
  const yamlSpec = YAML.load(path.join(__dirname, '../../../swagger.yaml'));
  swaggerSpec.paths = swaggerSpec.paths || {};
  if (yamlSpec && yamlSpec.paths) {
    Object.entries(yamlSpec.paths).forEach(([p, val]: any) => {
      if (!swaggerSpec.paths[p]) swaggerSpec.paths[p] = val;
    });
  }
  // merge components if present
  swaggerSpec.components = swaggerSpec.components || {};
  if (yamlSpec && yamlSpec.components) {
    swaggerSpec.components = { ...yamlSpec.components, ...swaggerSpec.components };
  }
} catch (mergeErr) {
  // ignore merge errors
}

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default router;