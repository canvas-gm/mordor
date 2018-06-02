# mordor
Mordor tower (Central Realtime Socket Server API for CGM).

## Getting Started

```bash
$ npm install
$ npm start
```

On the first start the server should generate a `customconfig.json` in the /config directory. Use it to configure the server like you want (and dont touch defaultconfig.json).

## Roadmap

- Add an interval to clean unvalided account every 24hours...
- Work on the socket client authentication with SQLite
- Allow to filter on getProjects socket command.
- Expose some JSON Articles with a REST endpoint
- Add tests with coverage
- Rework JSDoc to get a complete documentation badge
