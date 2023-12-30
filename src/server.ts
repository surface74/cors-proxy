import express from 'express';
import { Request } from 'express';
import cors from 'cors';
import request from 'request';
import dotenv from 'dotenv';

dotenv.config();

interface IRequestData {
  endpoint: string;
  query: string;
  variables?: string;
  requestHeaders?: string;
}

interface IRequestHeaders {
  [key: string]: string;
}

const app = express();
const port = process.env.PORT ?? 8080;

app.use(cors());
app.use(express.json());

app.options('*', cors());

app.get('/', (req, res) => {
  console.log('[GET] root');
  res.send({ message: 'Welcome to CORS proxy-server' });
});

app.get(
  '/proxy',
  (req: Request<unknown, unknown, unknown, IRequestData>, res) => {
    console.log('[GET] /proxy');

    const params = req.query;

    const endpoint = decodeURIComponent(params.endpoint);
    const query = decodeURIComponent(params.query);

    request
      .post(endpoint, {
        body: JSON.stringify({ query }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .on('error', function (error) {
        res.statusCode = 400;
        res.send({
          errors: [{ message: error.message, stack: error.stack ?? '' }],
        });
      })
      .pipe(res);
  }
);

app.post('/proxy', (req: Request<unknown, unknown, IRequestData>, res) => {
  console.log('[POST] /proxy');

  const { endpoint, query, variables, requestHeaders } = req.body;

  const parsedHeaders = JSON.parse(requestHeaders ?? '{}') as IRequestHeaders;

  const headers = {
    'Content-Type': 'application/json',
    ...parsedHeaders,
  };

  request
    .post(endpoint, {
      body: JSON.stringify({ query, variables }),
      headers,
    })
    .on('error', function (err) {
      res.send({ errors: [{ message: err.message, stack: err.stack ?? '' }] });
    })
    .pipe(res);
});

app.listen(port, () =>
  console.log(`CORS proxy-server is listening on port ${port}...`)
);
