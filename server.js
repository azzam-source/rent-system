const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data file
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({tenants:[], payments:[], archives:[]}));
}

function readData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch(e) { return {tenants:[], payments:[], archives:[]}; }
}
function writeData(d) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(d));
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  const url = req.url.split('?')[0];

  // Serve HTML app
  if (req.method === 'GET' && (url === '/' || url === '/app')) {
    const html = fs.readFileSync(path.join(__dirname, 'app.html'), 'utf8');
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(html); return;
  }

  // GET data
  if (req.method === 'GET' && url === '/api/data') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(readData())); return;
  }

  // POST sync data
  if (req.method === 'POST' && url === '/api/sync') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const d = JSON.parse(body);
        writeData(d);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ok:true}));
      } catch(e) {
        res.writeHead(400); res.end('Bad Request');
      }
    }); return;
  }

  res.writeHead(404); res.end('Not Found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server running on port ' + PORT));
