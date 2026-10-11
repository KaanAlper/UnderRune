// Standalone native battle server (the app's Vite server already serves /native/ itself).
import http from 'node:http';
import {createNativeHandler} from './native-handler.mjs';
const port = Number(process.env.NATIVE_PORT ?? 5185);
const handler = createNativeHandler();
http.createServer((req, res) => handler(req, res, () => { res.writeHead(404); res.end(); }))
  .listen(port, '127.0.0.1', () => console.log(`UnderRune source battle server http://127.0.0.1:${port}/native/`));
