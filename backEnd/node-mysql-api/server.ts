import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import errorHandler from './src/_middleware/error-handler';
import accountsController from './src/accounts/controller';
import swaggerDocs from './src/_helpers/swagger';

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true
  })
);

// api routes
app.use('/accounts', accountsController);

// swagger docs routes
app.use('/api-docs', swaggerDocs);

// global error handler
app.use(errorHandler);

// start server
const port =
  process.env.NODE_ENV === 'production'
    ? process.env.PORT || 80
    : 4000;

app.listen(port, () =>
  console.log('Server listening on port ' + port)
);