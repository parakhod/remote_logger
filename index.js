import Hapi from 'hapi';
import moment from 'moment';
import os from 'os';
import fs from 'fs';
import proc from 'child_process';

const ifaces = os.networkInterfaces();
const { exec } = proc;

const IPs = Object.keys(ifaces).reduce((prev, ifname) => [...prev, ...ifaces[ifname]], {})
  .filter(iface => iface.family === 'IPv4' && !iface.internal)
  .map(iface => iface.address);

console.log('ADD CODE TO YOUR APP:');
console.log('const localLog = t => fetch(`http://your-ip:4440/log?text=${t}`);');
console.log('');

IPs.forEach(ip => {

  const server=Hapi.server({
    host: ip,
    port: 4440
  });

  server.route({
    method:'GET',
    path:'/log',
    handler: (request) => {
      const message = request.query.text || 'unknown message';
      console.log(`${moment().format('hh:mm:ss')}: ${message}`);
      proc.exec(`say ${message}`, () => null);
      fs.appendFile('log.txt', `${moment().format('DD-MM-YYYY hh:mm:ss')} | ${message}`, () => null);
      return 'ok';
    }
  });

  server.start().then(() =>  console.log('Server running at:', server.info.uri));
});
