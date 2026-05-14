const fs = require('fs');
const content = fs.readFileSync('scratch/models.json', 'utf16le');
const models = JSON.parse(content);
const flashModels = models.models.filter(m => m.name.includes('flash')).map(m => m.name);
console.log(flashModels);
