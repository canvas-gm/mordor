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

- Add a ping/pong mechanism to verify if remote socket is alive!
- Work on authentication by sending an email with a token!
- Allow to filter on getProjects socket command.
- Add argon2 hash for the password (instead of temporary sha512 hMac)
- Improve events wrapper class
- Work on SSL support for both socket and http server. (Need to be secure to work as a Authorization Server).

## Issues

- TypeScript definition not always loaded
- expose net definition (past solution doesn't work well).
