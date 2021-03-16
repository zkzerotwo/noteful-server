require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const folderRouter = require('../folder/folder-router')
const noteRouter = require ('../notes/note-router')
// const folderNoteRouter = require('../folder-note/folderNoteRouter')
const validateBearerToken = require('./validate-bearer-token')



const app = express()

const morganOption = (process.env.NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, world!')
})

// app.use(validateBearerToken)

app.use('/folders/', folderRouter)
app.use('/notes/', noteRouter)
// app.use('folder/notes/', folderNoteRouter)

app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})

module.exports = app