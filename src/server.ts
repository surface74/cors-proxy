import express from 'express';
import { Request } from 'express';
import cors from 'cors';
import request from 'request';
import dotenv from 'dotenv';
import { Message } from './message';

dotenv.config();

interface IRequestData {
  endpoint: string;
  query: string;
  variables?: string;
  requestHeaders?: string;
  operationName?: string;
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
  res.send(Message.WELCOME);
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
  const { endpoint, query, variables, requestHeaders, operationName } =
    req.body;

  let parsedHeaders: IRequestHeaders = {};
  try {
    parsedHeaders = JSON.parse(requestHeaders || '{}') as IRequestHeaders;
  } catch (error) {
    res.send({
      errors: [{ message: Message.INVALID_HEADERS }],
    });
  }

  const headers = {
    'Content-Type': 'application/json',
    ...parsedHeaders,
  };

  let parsedVariables: IRequestHeaders = {};
  try {
    parsedVariables = JSON.parse(variables || '{}') as IRequestHeaders;
  } catch (error) {
    res.send({
      errors: [{ message: Message.INVALID_VARIABLES }],
    });
  }

  if (operationName && typeof operationName !== 'string') {
    res.send({
      errors: [{ message: Message.INVALID_OPERATION_NAME }],
    });
  }

  const bodyContent = operationName
    ? JSON.stringify({ query, variables: parsedVariables, operationName })
    : JSON.stringify({ query, variables: parsedVariables });

  request
    .post(endpoint, {
      body: bodyContent,
      headers,
    })
    .on('error', function (err) {
      res.send({ errors: [{ message: err.message, stack: err.stack ?? '' }] });
    })
    .pipe(res);
});

app.listen(port, () => console.log(`${Message.STARTED} ${port}...`));
