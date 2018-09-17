const express = require('express')
const path = require('path')
const port = process.env.PORT || 8080
const app = express()
const pug = require('pug')

// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname))

// send the user to index html page inspite of the url
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'))
})

const pages = ['spiro', 'spiro2', 'micromovements']

pages.forEach(function (page) {
  app.get('/' + page, function (req, res) {
    res.render(page + '.pug')
  })
})

app.listen(port)
