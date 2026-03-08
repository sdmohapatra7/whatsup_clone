const http = require('http');
const data = JSON.stringify({ username: 'shakti', password: '123' });
const req = http.request('http://localhost:8082/api/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Response:', body));
});
req.on('error', e => console.error(e));
req.write(data);
req.end();
