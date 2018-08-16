const { parseQueryString } = require('../util')
const { db, returnData } = require('../util/neo4j')
const { FormError, isString } = require('../util/validator')

function validateParams({ id }) {
  if (!id || !isString(id, /^[A-Za-z0-9_+/-]+$/)) {
    throw new FormError('Parameter `id` is required and should be a string')
  }
}

module.exports = async req => {
  try {
    const { id } = parseQueryString(req.url.split('?')[1] || '')
    validateParams({ id })
    const commands = [
      'MATCH (user:User)',
      `WHERE user.id = $id`,
      'OPTIONAL MATCH (user:User)-->(identity:Identity)',
      'RETURN user, collect(identity) AS identities',
      'LIMIT 1'
    ]
    const { records } = await db.run(commands.join(' '), { id })
    const { user = null, identities = [] } = returnData(records)[0] || {}
    return {
      success: true,
      result: { user, identities: identities.map(({ properties }) => properties) }
    }
  } catch (error) {
    return { success: false, error: `[${error.code}] ${error.message}` }
  }
}
