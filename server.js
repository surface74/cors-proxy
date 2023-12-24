const express = require('express');
const cors = require('cors');
const request = require('request');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.options('*', cors());

app.get('/', (req, res) => {
  console.log('[GET] root');
  res.send({ 'message': 'Welcome to CORS proxy-server' })
});

app.get('/proxy', (req, res, next) => {
  console.log('[GET] /proxy');

  const endpoint = decodeURIComponent(req.query.endpoint);
  const query = decodeURIComponent(req.query.query);

  request.post(endpoint,
    {
      body: JSON.stringify({ query }),
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .on('error', function (error) {
      res.statusCode = 400;
      res.send({ errors: [{ 'message': error.message, 'stack': error.stack || '' }] });
    })
    .pipe(res);
});

app.post('/proxy', (req, res) => {
  console.log('[POST] /proxy');

  const { endpoint, query } = req.body;
  request.post(endpoint,
    {
      body: JSON.stringify({ query }),
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .on('error', function (err) {
      res.statusCode = 400;
      res.send({ errors: [{ 'message': err.message, 'stack': err.stack || '' }] });
    })
    .pipe(res);

});

app.listen(port, () =>
  console.log(`CORS proxy-server is listening on port ${port}...`)
);
