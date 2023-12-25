"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const request_1 = __importDefault(require("request"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 8080;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.options('*', (0, cors_1.default)());
app.get('/', (req, res) => {
    console.log('[GET] root');
    res.send({ message: 'Welcome to CORS proxy-server' });
});
app.get('/proxy', (req, res) => {
    console.log('[GET] /proxy');
    const params = req.query;
    const endpoint = decodeURIComponent(params.endpoint);
    const query = decodeURIComponent(params.query);
    request_1.default
        .post(endpoint, {
        body: JSON.stringify({ query }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .on('error', function (error) {
        var _a;
        res.statusCode = 400;
        res.send({
            errors: [{ message: error.message, stack: (_a = error.stack) !== null && _a !== void 0 ? _a : '' }],
        });
    })
        .pipe(res);
});
app.post('/proxy', (req, res) => {
    console.log('[POST] /proxy');
    const { endpoint, query } = req.body;
    request_1.default
        .post(endpoint, {
        body: JSON.stringify({ query }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .on('error', function (err) {
        var _a;
        res.statusCode = 400;
        res.send({ errors: [{ message: err.message, stack: (_a = err.stack) !== null && _a !== void 0 ? _a : '' }] });
    })
        .pipe(res);
});
app.listen(port, () => console.log(`CORS proxy-server is listening on port ${port}...`));
