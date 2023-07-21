const path = require('path')
const filesRoute = require('./routes')
const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.use(express.static('public'))
app.use(express.static('client/dist'))

app.use('/files', filesRoute)

app.use('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'))
})

const server = app.listen(port, () => {
  const { address, port } = server.address()
  console.log(`Server is running at http://${address}:${port}`)
})
module.export = server
