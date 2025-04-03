const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'client/public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/public/index.html'));
});

const server = app.listen(process.env.PORT || 8000, () => {
  console.log('Server is running...');
});

app.use((req, res) => {
  res.status(404).send({ message: 'Not found...' });
});