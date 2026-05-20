const swaggerJSDoc = require('swagger-jsdoc');
const YAML = require('yamljs');
const path = require('path');

const swaggerBaseUrl = process.env.BASE_URL || 'https://angular-21-boilerplate-2-1.onrender.com';

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
    path.join(__dirname, '../src/**/*.ts'),
    path.join(__dirname, '../dist/**/*.js')
  ]
};

let swaggerSpec = {};
try {
  swaggerSpec = swaggerJSDoc(options) || {};
} catch (e) {
  console.error('JSDOC ERR', e && e.message);
}

try {
  const yamlSpec = YAML.load(path.join(__dirname, '../..', 'swagger.yaml'));
  swaggerSpec.paths = swaggerSpec.paths || {};
  if (yamlSpec && yamlSpec.paths) {
    Object.entries(yamlSpec.paths).forEach(([p, val]) => {
      if (!swaggerSpec.paths[p]) swaggerSpec.paths[p] = val;
    });
  }
  swaggerSpec.components = swaggerSpec.components || {};
  if (yamlSpec && yamlSpec.components) {
    swaggerSpec.components = { ...yamlSpec.components, ...swaggerSpec.components };
  }
} catch (e) {}

console.log('FINAL_PATHS:\n' + Object.keys(swaggerSpec.paths || {}).sort().join('\n'));
