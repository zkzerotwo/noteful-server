const logger = require('../src/logger')


const NO_ERRORS = null

function getFolderValidationError(folder) {
  if (!folder || typeof folder.name !== 'string') {
    logger.error(`Invalid folder name '${folder.name}' supplied`)
    return {
      error: {
        message: `'folder.name' must be a string`
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
  getFolderValidationError,
}