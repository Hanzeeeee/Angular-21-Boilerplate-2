import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import config from './config';
import errorHandler from './src/_middleware/error-handler';
import accountsController from './src/accounts/controller';
import swaggerDocs from './src/_helpers/swagger';

const app = express();
app.set('trust proxy', 1);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [config.frontendUrl, 'http://localhost:4200'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (!config.isProduction || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked origin: ${origin}`));
    },
    credentials: true
  })
);

app.get('/', (req, res) => {
  res.json({ message: 'Backend API is running' });
});

// api routes
app.use('/accounts', accountsController);

// swagger docs routes
app.use('/api-docs', swaggerDocs);

// global error handler
app.use(errorHandler);

// start server
const port = process.env.PORT || config.port || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});