const http = require('http');

http.get('http://localhost:8082/api/messages/recent/shakti', (res) => {
    console.log('Status Code:', res.statusCode);
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => console.log('Response:', data));
}).on('error', (err) => console.error('Error:', err.message));

const postReq = http.request('http://localhost:8082/api/users/logout/shakti', { method: 'POST' }, (res) => {
    console.log('Login Status Code:', res.statusCode);
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => console.log('Login Response:', data));
});
postReq.on('error', (err) => console.error('Error:', err.message));
postReq.end();
