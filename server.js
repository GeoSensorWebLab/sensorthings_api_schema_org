const express = require('express');
const fs = require('fs');
const app = express();
const port = 5000;

app.set('view engine', 'pug');

app.use(express.static('public'));

app.get('/', function (req, res) {

  // Collect all the JSON report files from the "public" directory.
  // Ignore invisible files.
  let reports = fs.readdirSync('public').reduce((memo, file) => {
    if (!file.startsWith(".") && file.endsWith(".json")) {
      memo.push(file);
    }
    return memo;
  }, []);

  // Render the index page with a list of schema.org report files.
  res.render('index', { reports: reports });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
