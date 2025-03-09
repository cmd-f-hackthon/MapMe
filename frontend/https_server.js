// // HTTP Version

// const { createServer } = require('http'); // Changed from 'https' to 'http'
// const { parse } = require('url');
// const next = require('next');

// const dev = process.env.NODE_ENV !== 'production';
// const app = next({ dev });
// const handle = app.getRequestHandler();

// app.prepare().then(() => {
//   createServer((req, res) => {
//     const parsedUrl = parse(req.url, true);
//     handle(req, res, parsedUrl);
//   }).listen(3000, (err) => {
//     if (err) throw err;
//     console.log('> Ready on http://localhost:3000'); // Changed from https to http
//   });
// });

// // ----------------------------
// // // HTTPS Version

// // if you wish to use HTTPS, change 'dev' under 'scripts' in package.json to have 'node https_server.js' as value

// // const { createServer } = require('https');
// // const { parse } = require('url');
// // const next = require('next');
// // const fs = require('fs');
// // const path = require('path');

// // const dev = process.env.NODE_ENV !== 'production';
// // const app = next({ dev });
// // const handle = app.getRequestHandler();

// // const httpsOptions = {
// //   key: fs.readFileSync(path.join(__dirname, 'localhost-key.pem')),
// //   cert: fs.readFileSync(path.join(__dirname, 'localhost.pem')),
// // };

// // app.prepare().then(() => {
// //   createServer(httpsOptions, (req, res) => {
// //     const parsedUrl = parse(req.url, true);
// //     handle(req, res, parsedUrl);
// //   }).listen(3000, (err) => {
// //     if (err) throw err;
// //     console.log('> Ready on https://localhost:3000');
// //   });
// // });

// // ----------------------------