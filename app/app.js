const path = require('path');
const filesRoute = require('./routes');
const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'))
app.use(express.static('client/dist'))

app.use('/files', filesRoute);
app.use('/', (req, res)=>{
    res.sendFile(path.join(__dirname, '../client/public/index.html'));
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
