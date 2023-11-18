const port = process.env.PORT || 3000
const path = require('path')
const apiRoutes = require('./routes')
const express = require('express')
const app = express()
const mongoose = require('mongoose');

mongoose.connect('mongodb://mongo:27017/fastChange', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api', apiRoutes)

const server = app.listen(port, () => {
  const { address, port } = server.address()
  console.log(`Server is running at http://${address}:${port}`)
})
module.export = server
