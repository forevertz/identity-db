const { json } = require('micro')

const { validateIdentity, validateConnector } = require('../model')
const { generateId } = require('../util')
const { db, returnData } = require('../util/neo4j')

module.exports = async req => {
  try {
    const { identity = {}, connector = {} } = await json(req, { encoding: 'utf8' })
    validateConnector(connector)
    if (!identity.id) identity.id = generateId()
    validateIdentity(identity)
    if (identity.languages) identity.languages = identity.languages.join(',')
    const commands = [
      'MATCH (connector:Connector { provider: $connector.provider, userId: $connector.userId })',
      'MERGE (identity:Identity { id: $identity.id })',
      'ON CREATE SET identity.created = timestamp()',
      'SET identity += $identity',
      'MERGE (identity)<-[:VOUCHES_FOR]-(connector)',
      'RETURN identity'
    ]
    const { records } = await db.run(commands.join(' '), { connector, identity })
    return { success: true, result: returnData(records)[0] }
  } catch (error) {
    return { success: false, error: `[${error.code}] ${error.message}` }
  }
}
