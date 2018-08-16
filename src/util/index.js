const crypto = require('crypto')

function parseQueryString(queryString) {
  return queryString.split('&').reduce(
    (params, paramString) => ({
      ...params,
      [paramString.split('=')[0]]: paramString
        .split('=')
        .slice(1)
        .join('')
    }),
    {}
  )
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function generateId(string) {
  return crypto
    .randomBytes(26)
    .toString('base64')
    .replace('=', '')
}

module.exports = {
  parseQueryString,
  capitalize,
  generateId
}
