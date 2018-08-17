const { json } = require('micro')

const { generateId } = require('../util')
const { db } = require('../util/neo4j')
const { FormError, isString } = require('../util/validator')

function validateParams({ userId, id }) {
  if (!userId || !isString(userId, /^[A-Za-z0-9_+/-]+$/)) {
    throw new FormError('Parameter `userId` is required and should be a string')
  }
  if (!id || !isString(id, /^[A-Za-z0-9_+/-]+$/)) {
    throw new FormError('Parameter `id` is required and should be a string')
  }
}

module.exports = async req => {
  try {
    const { userId, id = generateId(), label, pseudo, avatar, presentation, website } = await json(
      req,
      { encoding: 'utf8' }
    )
    const params = { label, pseudo, avatar, presentation, website }
    validateParams({ userId, id, ...params })
    const commands = [
      'MATCH (user:User { id: $userId })',
      'MERGE (identity:Identity { id: $id })',
      'ON CREATE SET identity.created = timestamp()',
      'MERGE (user)-[:IS]->(identity)',
      'SET identity += $params'
    ]
    await db.run(commands.join(' '), { userId, id, params })
    return { success: true }
  } catch (error) {
    return { success: false, error: `[${error.code}] ${error.message}` }
  }
}
