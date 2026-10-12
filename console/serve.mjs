// Serves the TRUEQ launch console only on this computer (127.0.0.1:8787). Phantom works on http://localhost.
import http from 'node:http';import {readFile} from 'node:fs/promises';import {fileURLToPath} from 'node:url';import path from 'node:path';
const dir=path.dirname(fileURLToPath(import.meta.url));
const files={'/':'index.html','/index.html':'index.html','/web3.iife.min.js':'web3.iife.min.js','/trueq-builders.js':'trueq-builders.js'};
const types={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8'};
http.createServer(async(req,res)=>{
  const f=files[new URL(req.url,'http://localhost').pathname];
  if(!f){res.writeHead(404);res.end('No encontrado');return;}
  res.writeHead(200,{'content-type':types[f.split('.').pop()],'cache-control':'no-store'});res.end(await readFile(path.join(dir,f)));
}).listen(8787,'127.0.0.1',()=>console.log('Consola de TRUEQ lista: abre http://localhost:8787 en el navegador donde tienes Phantom. Ctrl+C para cerrarla.'));
