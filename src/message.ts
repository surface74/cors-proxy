export const Message = {
  WELCOME: '<p>Welcome to CORS proxy-server for GraphQL-query.</p>',
  HELP: `Send POST-request with JSON-stringify values in request's body on /proxy endpoint<br><br>
  body: IRequestData<br><br>
  interface IRequestData {<br>
    endpoint: string;<br>
    query: string;<br>
    variables?: string;<br>
    requestHeaders?: string;<br>
    operationName?: string;<br>
  }`,
  STARTED: 'CORS proxy-server is listening on port',
  INVALID_HEADERS: 'Passed invalid post.body.requestHeaders',
  INVALID_VARIABLES: 'Passed invalid post.body.requestHeaders',
  INVALID_OPERATION_NAME: 'Passed invalid post.body.requestHeaders',
} as const;
