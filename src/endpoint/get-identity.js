const { validateIdentity } = require('../model')
const { parseQueryString } = require('../util')
const { db, returnData } = require('../util/neo4j')

module.exports = async req => {
  try {
    const params = parseQueryString(req.url.split('?')[1] || '')
    validateIdentity(params)
    const commands = [
      `MATCH (identity:Identity { ${Object.keys(params)
        .map(key => `${key}: $${key}`)
        .join(', ')} })`,
      'RETURN identity'
    ]
    const { records } = await db.run(commands.join(' '), params)
    return { success: true, result: returnData(records)[0] || null }
  } catch (error) {
    return { success: false, error: `[${error.code}] ${error.message}` }
  }
}
