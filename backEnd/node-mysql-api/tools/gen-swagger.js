const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const swaggerBaseUrl = process.env.BASE_URL || 'https://angular-21-boilerplate-2-1.onrender.com';

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Node.js API', version: '1.0.0' },
    servers: [
      { url: 'http://localhost:4000', description: 'Development server' },
      { url: swaggerBaseUrl, description: 'Production server' }
    ]
  },
  apis: [
    path.join(__dirname, '../src/**/*.ts'),
    path.join(__dirname, '../dist/**/*.js'),
    path.join(__dirname, '../../swagger.yaml')
  ]
};

try {
  const spec = swaggerJSDoc(options);
  const paths = spec.paths || {};
  console.log('FOUND_PATHS');
  console.log(Object.keys(paths).sort().join('\n'));
  // print a few relevant paths presence
  const check = ['/accounts/verify-email','/accounts/forgot-password','/accounts/reset-password','/accounts/authenticate','/accounts/register','/accounts/validate-reset-token'];
  console.log('\nCHECKS:');
  check.forEach(p => console.log(p + ': ' + (paths[p] ? 'FOUND' : 'MISSING')));
} catch (err) {
  console.error('ERROR_GENERATING_SPEC', err && err.message ? err.message : err);
  process.exit(1);
}

// merge static YAML paths if present
try {
  const YAML = require('yamljs');
  const yamlSpec = YAML.load(path.join(__dirname, '../..', 'swagger.yaml'));
  if (yamlSpec && yamlSpec.paths) {
    const merged = Object.assign({}, require('./gen-swagger.tmp') || {}, {});
    const allPaths = Object.assign({}, (swaggerJSDoc(options).paths || {}), yamlSpec.paths || {});
    console.log('\nMERGED_PATHS');
    console.log(Object.keys(allPaths).sort().join('\n'));
  }
} catch (e) {
  // ignore
}
