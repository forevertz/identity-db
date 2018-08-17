const { json } = require('micro')

const getIdentities = require('./get-identities')
const { validateDevice, validateConnector } = require('../model')
const { db } = require('../util/neo4j')

module.exports = async req => {
  try {
    const { connector = {}, device = {} } = await json(req, { encoding: 'utf8' })
    validateConnector(connector)
    validateDevice(device)
    const now = Date.now()
    const commands = [
      'MERGE (connector:Connector { provider: $connector.provider, userId: $connector.userId })',
      'ON CREATE SET connector.created = $now',
      'MERGE (device:Device { id: $device.id, userAgent: $device.userAgent })',
      'ON CREATE SET device.created = $now',
      'CREATE (connector)-[:FROM { created: $now }]->(device)'
    ]
    await db.run(commands.join(' '), { now, connector, device })
    return getIdentities({
      ...req,
      url: `/?provider=${connector.provider}&userId=${connector.userId}`
    })
  } catch (error) {
    return { success: false, error: `[${error.code}] ${error.message}` }
  }
}
