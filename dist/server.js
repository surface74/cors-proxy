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
const message_1 = require("./message");
const EMPTY_JSON_STRING = '{}';
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 8080;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.options('*', (0, cors_1.default)());
app.get('/', (req, res) => {
    res.send(message_1.Message.WELCOME);
});
app.post('/proxy', (req, res) => {
    const { endpoint, query, variables, requestHeaders, operationName } = req.body;
    let parsedHeaders = {};
    try {
        parsedHeaders = JSON.parse(requestHeaders || EMPTY_JSON_STRING);
    }
    catch (error) {
        res.send({
            errors: [{ message: message_1.Message.INVALID_HEADERS }],
        });
    }
    const headers = Object.assign({ 'Content-Type': 'application/json' }, parsedHeaders);
    let parsedVariables = {};
    try {
        parsedVariables = JSON.parse(variables || EMPTY_JSON_STRING);
    }
    catch (error) {
        res.send({
            errors: [{ message: message_1.Message.INVALID_VARIABLES }],
        });
    }
    if (operationName && typeof operationName !== 'string') {
        res.send({
            errors: [{ message: message_1.Message.INVALID_OPERATION_NAME }],
        });
    }
    const bodyContent = operationName
        ? JSON.stringify({ query, variables: parsedVariables, operationName })
        : JSON.stringify({ query, variables: parsedVariables });
    request_1.default
        .post(endpoint, {
        body: bodyContent,
        headers,
    })
        .on('error', function (err) {
        var _a;
        res.send({ errors: [{ message: err.message, stack: (_a = err.stack) !== null && _a !== void 0 ? _a : '' }] });
    })
        .pipe(res);
});
// Message about server has been started
app.listen(port, () => console.log(`${message_1.Message.STARTED} ${port}...`));
