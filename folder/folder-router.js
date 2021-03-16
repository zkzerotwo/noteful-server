const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../src/logger')
const FolderService = require('./folder-service')
const { getFolderValidationError } = require('./folder-validation')

const folderRouter = express.Router()
const bodyParser = express.json()

const serializeFolder = folder => ({
  id: folder.id,
  name: xss(folder.name)
})

const serializeNotesInFolder = (notes) => ({  
  id: notes.id,
  name: xss(notes.name),
  modified: notes.modified,
  content: xss(notes.content),
  folderId: notes.folder
})

folderRouter
  .route('/')

  .get((req, res, next) => {
    FolderService.getAllFolder(req.app.get('db'))
      .then(folder => {
        res.json(folder.map(serializeFolder))
      })
      .catch(next)
  })


  .post(bodyParser, (req, res, next) => {
    const { name } = req.body
    const newFolder = { name }

    for (const [key, value] of Object.entries(newFolder)) {
      if (value == null) {
        logger.error(`${key} is required`)
        return res.status(400).send({
          error: { message: `'${key}' is required` }
        })
      }
    }

    const error = getFolderValidationError(newFolder)

    if (error) return res.status(400).send(error)

    FolderService.insertFolder(
      req.app.get('db'),
      newFolder
    )
      .then(folder => {
        logger.info(`Folder with id ${folder.id} created.`)
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${folder.id}`))
          .json(serializeFolder(folder))
      })
      .catch(next)
  })

folderRouter
  .route('/:folder_id')
  .all((req, res, next) => {
    const { folder_id } = req.params
    FolderService.getById(req.app.get('db'), folder_id)
      .then(folder => {
        if (!folder) {
          logger.error(`Folder with id ${folder_id} not found.`)
          return res.status(404).json({
            error: { message: `Folder doesn't exist` }
          })
        }
        res.folder = folder
        next()
      })
      .catch(next)
  })
  .get((req, res) => {
    res.json(serializeFolder(res.folder))
  })

  .delete((req, res, next) => {
    const { folder_id } = req.params
    FolderService.deleteFolder(
      req.app.get('db'),
      folder_id
    )
      .then(numRowsAffected => {
        logger.info(`Folder with id ${folder_id} deleted.`)
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(bodyParser, (req, res, next) => {
    const { id, name } = req.body
    const folderToUpdate = { id, name }

    const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain a 'name'`
        }
      })
    }

    const error = getFolderValidationError(folderToUpdate)

    if (error) return res.status(400).send(error)

    FolderService.updateFolder(
      req.app.get('db'),
      req.params.folder_id,
      folderToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

folderRouter
  .route('/:folder_id/notes')
  .all((req, res, next) => {
    const { folder_id } = req.params
    console.log(req.params)
    FolderService.getNotesByFolder(req.app.get('db'), folder_id)
      .then(folder => {
        if (!folder) {
          logger.error(`Folder with id ${folder_id} not found.`)
          return res.status(404).json({
            error: { message: `Folder doesn't exist` }
          })
        }
        res.folder = folder
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    const { folder_id } = req.params
    // console.log(res.folder.id)
    FolderService.getNotesByFolder(res.app.get('db'), folder_id)
      .then(notes => {
        res.json({ notes })
      })
      .catch(next)
  })

module.exports = folderRouter

