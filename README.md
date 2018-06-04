# mordor
Mordor tower (Central Realtime Socket Server API for CGM). Work as the main HTTP API to create an account too.

## Getting Started

```bash
$ npm install
$ npm start
```

On the first start the server should generate a `customconfig.json` in the /config directory. Use it to configure the server like you want (and dont touch defaultconfig.json).

## Design limitation

The project has been designed to work with a local database. If more performance and scalability are required we should evolve with a real database like MySQL or RethinkDB.

## Roadmap

### Major
- Work on authentication by sending an email with a token!
- Work on Auth flow (AccessToken for App & GameServ).
- Work on SSL support for both socket and http server. (Need to be secure to work as a Authorization Server).

### Minor
- Allow to filter on getProjects socket command.
