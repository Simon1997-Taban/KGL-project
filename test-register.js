const http = require('http');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');

const form = new FormData();
form.append('name', 'Test User');
form.append('email', `test-${Date.now()}@example.com`);
form.append('password', 'testpass123');
form.append('confirmPassword', 'testpass123');
form.append('role', 'procurement');

// Create a dummy image file
const dummyImagePath = path.join(__dirname, 'dummy.jpg');
const dummyImageData = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]); // JPEG header
fs.writeFileSync(dummyImagePath, dummyImageData);

form.append('photo', fs.createReadStream(dummyImagePath));

const options = {
  method: 'POST',
  host: 'localhost',
  port: 3000,
  path: '/api/auth/register',
  headers: form.getHeaders()
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);
    console.log('Body:', data);
    fs.unlinkSync(dummyImagePath);
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.error('Request error:', err);
  fs.unlinkSync(dummyImagePath);
  process.exit(1);
});

form.pipe(req);
