const { validateConnector } = require('../model')
const { parseQueryString } = require('../util')
const { db, returnData } = require('../util/neo4j')

module.exports = async req => {
  try {
    const { provider, userId } = parseQueryString(req.url.split('?')[1] || '')
    const connector = { provider, userId }
    validateConnector(connector)
    const commands = [
      'MATCH (connector:Connector { provider: $connector.provider, userId: $connector.userId })',
      'OPTIONAL MATCH (identity:Identity)<-[:VOUCHES_FOR]-(connector)',
      'RETURN identity'
    ]
    const { records } = await db.run(commands.join(' '), { connector })
    return { success: true, result: returnData(records).map(({ identity }) => identity) }
  } catch (error) {
    return { success: false, error: `[${error.code}] ${error.message}` }
  }
}
