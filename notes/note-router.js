const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../src/logger')
const NoteService = require('./note-service')
const { getNoteValidationError } = require('./note-validation')

const noteRouter = express.Router()
const bodyParser = express.json()

serializeNotes = note => ({
    id: note.id,
    name: xss(note.name),
    modified: note.modified,
    content: xss(note.content),
    folder: note.folder
})

noteRouter
.route('/')

  .get((req, res, next) => {
    NoteService.getAllNote(req.app.get('db'))
      .then(note => {
        res.json(note.map(serializeNotes))
      })
      .catch(next)
  })


  .post(bodyParser, (req, res, next) => {
    const { name,  content, folder } = req.body
    const newNote = { name, content, folder }

    for (const [key, value] of Object.entries(newNote)) {
      if (value == null) {
        logger.error(`${key} is required`)
        return res.status(400).send({
          error: { message: `'${key}' is required` }
        })
      }
    }

    const error = getNoteValidationError(newNote)

    if (error) return res.status(400).send(error)

    NoteService.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(note => {
        logger.info(`Note with id ${note.id} created.`)
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${note.id}`))
          .json(serializeNotes(note))
      })
      .catch(next)
  })

  noteRouter
  .route('/:note_id')
  .all((req, res, next) => {
    const { note_id } = req.params
    NoteService.getById(req.app.get('db'), note_id)
      .then(note => {
        if (!note) {
          logger.error(`Note with id ${note_id} not found.`)
          return res.status(404).json({
            error: { message: `Note doesn't exist` }
          })
        }
        res.note = note
        next()
      })
      .catch(next)
  })
  .get((req, res) => {
    res.json(serializeNotes(res.note))
  })
  .delete((req, res, next) => {
    const { note_id } = req.params
    NoteService.deleteNote(
      req.app.get('db'),
      note_id
    )
      .then(numRowsAffected => {
        logger.info(`Note with id ${note_id} deleted.`)
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(bodyParser, (req, res, next) => {
    const { id, name, content, folder } = req.body
    const noteToUpdate = { id, name, content, folder }

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain a 'name'`
        }
      })
    }

    const error = getNoteValidationError(noteToUpdate)

    if (error) return res.status(400).send(error)

    NoteService.updateNote(
      req.app.get('db'),
      req.params.note_id,
      noteToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })


module.exports = noteRouter