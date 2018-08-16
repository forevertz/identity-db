function FormError(message, code = 'FormError') {
  const error = new Error(message)
  error.code = code
  return error
}

function isString(string, pattern = false) {
  return typeof string === 'string' && (!pattern || pattern.test(string))
}

module.exports = {
  FormError,
  isString
}
