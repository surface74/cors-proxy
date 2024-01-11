import express from 'express';
import { Request } from 'express';
import cors from 'cors';
import request from 'request';
import dotenv from 'dotenv';
import { Message } from './message';

const EMPTY_JSON_STRING= '{}';

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
  res.send(`${Message.WELCOME} ${Message.HELP}`);
});

app.post('/proxy', (req: Request<unknown, unknown, IRequestData>, res) => {
  const { endpoint, query, variables, requestHeaders, operationName } =
    req.body;

  let parsedHeaders: IRequestHeaders = {};
  try {
    parsedHeaders = JSON.parse(requestHeaders || EMPTY_JSON_STRING) as IRequestHeaders;
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
    parsedVariables = JSON.parse(variables || EMPTY_JSON_STRING) as IRequestHeaders;
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

// Message about server has been started
app.listen(port, () => console.log(`${Message.STARTED} ${port}...`));
