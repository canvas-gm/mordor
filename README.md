# mordor
Mordor tower (Geek reference to the FILM `Seigneur des anneaux`).

What is ?

- The central Socket API of CanvasGM. (Authentication, Share all connected servers to connected clients).
- HTTP Server that allow to register a new account (maybe more later).

## Prerequisites

To use and start the project you will need at least:

- node.js version 10 or higher.
- npm version 6 or higher.
- [Windows-build-tools](https://github.com/felixrieseberg/windows-build-tools) on Windows to be able to build native addons.
- RethinkDB 2.3.6 or higher

## Getting Started

To install and start the project, please write and run these commands on your favorite terminal:

```bash
$ npm install
$ npm run build
$ npm start
```

At the first start, the server will generate a new `editableSettings.json` in the root folder `/config`. Use this file to configure your server like you want ! (Without having to touch defaultSettings).

For more help on how to use APIs, please run the following npm command to generate the documentation:
```bash
npm run doc
```

A new root folder `docs` should appear. Move in and open `index.html` with your favorite browser.

To run the project tests and coverage:
```bash
$ npm test
$ npm run coverage
$ npm run report
```

## Project tree

All important files and folders to know are here:

```
├── config [Where configuration are stored]
├── index.d.ts [TypeScript definition file]
├── index.js [Main Server entry]
├── esdoc.json [JSdoc (esdoc) configuration]
├── package-lock.json
├── package.json [npm/node main manifest]
├── .editorconfig [To force your code editor to get the right configuration]
├── .eslintrc [ESLint configuration, allow to force a given syntax and allow developer to quickly found bugs]
├── README.md
├── data [Where some JSON data are stored (like Articles)]
├── db [Where local database are stored]
├── public [All public assets that are served by the HTTP Server to be used on the Front-end]
├── views [HTLM Views used by the HTTP Server]
├── src
|  ├── utils.js [Utils functions used across the project]
|  ├── autoloader.js [Autoloader for sockets commands]
|  ├── httpServer.js [Where the http server as well as his middleware are declared]
|  ├── socketHandler.js [Where we manage main socket handler]
|  ├── viewRenderer.js [Little function to render HTML View with a memory cache]
|  ├── routes [Where all http route are stored]
|  ├── sockets [Where all sockets commands are stored]
|  └── class [Where all class used in the project are stored]
└── test
```

## Roadmap

### Major
- [Issue](https://github.com/canvas-gm/mordor/issues/2) Store Servers and Projects on the Disk (avoid memory usage).
- [Issue](https://github.com/canvas-gm/mordor/issues/3) Work on authentication by sending an email with a token!

### Minor
- Improve front-end registration error handling
- Allow more settings to be registered for a Server.
- Allow to filter on getProjects socket command.
- Work on SSL support for both socket and http server. (Need to be secure to work as a Authorization Server).

