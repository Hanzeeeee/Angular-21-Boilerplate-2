import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const router = express.Router();
const swaggerDocument = YAML.load(path.join(__dirname, '../../../swagger.yaml'));

const swaggerBaseUrl = process.env.BASE_URL || 'https://angular-21-boilerplate-2-1.onrender.com';
swaggerDocument.servers = [
  { url: 'http://localhost:4000', description: 'Development server' },
  { url: swaggerBaseUrl, description: 'Production server' }
];

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;