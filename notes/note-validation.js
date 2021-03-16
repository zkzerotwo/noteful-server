const folderRouter = require('../folder/folder-router')
const logger = require('../src/logger')


const NO_ERRORS = null

function getNoteValidationError(note) {
  if (!note || typeof note.name !== 'string') {
    logger.error(`Invalid note name '${note.name}' supplied`)
    return {
      error: {
        message: `'note.name' must be a string`
      }
    }
  }

  if (typeof note.content !== 'string') {
    logger.error(`Invalid note name '${note.content}' supplied`)
    return {
      error: {
        message: `'note.content' must be a string`
      }
    }
  }
//TODO: add validation for valid folder id
  if (typeof note.folder !== 'number' 
//   || note.folderId > folders.length?
  ) {
    logger.error(`Invalid note name '${note.folder}' supplied`)
    return {
      error: {
        message: `'note.folderId' must be a valid number`
      }
    }
  }


  // if (url && !isWebUri(url)) {
  //   logger.error(`Invalid url '${url}' supplied`)
  //   return {
  //     error: {
  //       message: `'url' must be a valid URL`
  //     }
  //   }
  // }

  return NO_ERRORS
}

module.exports = {
  getNoteValidationError,
}