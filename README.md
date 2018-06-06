# mordor
Mordor tower (Central Realtime Socket Server API for CGM). Work as the main HTTP API to create an account too.

## Prerequisites

To use and start the project you will need at least:

- node.js version 10 or higher.
- npm version 5 or higher.

## Getting Started

To install and start the project, please write and run these commands on your favorite terminal:

```bash
$ npm install
$ npm start
```

At the first start, the server will generate a new `editableSettings.json` in the root folder `/config`. Use this file to configure your server like you want ! (Without having to touch defaultSettings).

For more help on how to use APIs, please run the following npm command to generate the documentation:
```bash
npm run doc
```

A new root folder `docs` should appear. Move in and open `index.html` with your favorite browser.

## Design limitation

The project has been designed to work with a local database. If more performance and scalability are required we should evolve with a real database like MySQL or RethinkDB.

## Roadmap

### Major
- Store Servers and Projects on the Disk (avoid memory usage).
- Work on authentication by sending an email with a token!
- Work on SSL support for both socket and http server. (Need to be secure to work as a Authorization Server).
- Add complete tests set.

### Minor
- Allow more settings to be registered for a Server.
- Allow to filter on getProjects socket command.
- Complete JSDoc documentation
