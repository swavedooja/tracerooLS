const https = require('https');

const key = 'AIzaSyC177pNZp6xLh4ZfodW8ZYm9Vif-lq_8MI';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(data);
    process.exit(0);
  });
}).on('error', (err) => {
  console.error(err);
  process.exit(1);
});
