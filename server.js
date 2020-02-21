const express = require('express');
const app = express();
const port = 5000;

app.set('view engine', 'pug');

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.render('index', { message: 'Hello there!' });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
