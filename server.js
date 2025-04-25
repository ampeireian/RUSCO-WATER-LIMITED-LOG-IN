require('dotenv').config();
const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');
const multer = require('multer');
const path = require('path');

const app = express();
const upload = multer({ dest: 'public/uploads/' });

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize CSV files
const initCSV = () => {
  if (!fs.existsSync('data')) fs.mkdirSync('data');
  if (!fs.existsSync('data/workers.csv')) {
    fs.writeFileSync('data/workers.csv', 'email,password,full_name\n');
  }
  if (!fs.existsSync('data/logs.csv')) {
    fs.writeFileSync('data/logs.csv', 'worker_email,date,start_time,end_time,job_type,photo_path\n');
  }
};
initCSV();

// API Endpoints
app.post('/register', (req, res) => {
  const { email, password, full_name } = req.body;
  const csvWriter = createObjectCsvWriter({
    path: 'data/workers.csv',
    header: ['email', 'password', 'full_name'].map(id => ({ id, title: id })),
    append: true
  });
  csvWriter.writeRecords([{ email, password, full_name }])
    .then(() => res.json({ success: true }))
    .catch(err => res.status(500).json({ error: err.message }));
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const results = [];
  fs.createReadStream('data/workers.csv')
    .pipe(csv())
    .on('data', (row) => results.push(row))
    .on('end', () => {
      const user = results.find(u => u.email === email && u.password === password);
      user ? res.json({ success: true, email }) : res.status(401).json({ error: 'Invalid credentials' });
    });
});

app.post('/submit-log', upload.single('photo'), (req, res) => {
  const { worker_email, job_type } = req.body;
  const csvWriter = createObjectCsvWriter({
    path: 'data/logs.csv',
    header: ['worker_email', 'date', 'start_time', 'end_time', 'job_type', 'photo_path'].map(id => ({ id, title: id })),
    append: true
  });
  csvWriter.writeRecords([{
    worker_email,
    date: new Date().toISOString().split('T')[0],
    start_time: new Date().toLocaleTimeString(),
    end_time: new Date().toLocaleTimeString(),
    job_type,
    photo_path: req.file ? `/uploads/${req.file.filename}` : ''
  }]).then(() => res.json({ success: true }));
});

app.listen(process.env.PORT || 3000, () => console.log('Server running'));