const { json } = require('micro')

const getUser = require('./get-user')
const { generateId } = require('../util')
const { db } = require('../util/neo4j')
const { FormError, isString } = require('../util/validator')

function validateParams({ provider, providerUserId, deviceId, userAgent }) {
  if (!provider || !isString(provider, /^[A-Za-z0-9_-]+$/)) {
    throw new FormError('Parameter `provider` is required and should be a string')
  }
  if (!providerUserId || !isString(providerUserId, /^[A-Za-z0-9_-]+$/)) {
    throw new FormError('Parameter `providerUserId` is required and should be a string')
  }
  if (!deviceId || !isString(deviceId, /^[A-Za-z0-9_-]+$/)) {
    throw new FormError('Parameter `deviceId` is required and should be a string')
  }
  if (!userAgent || !isString(userAgent, /.*/)) {
    throw new FormError('Parameter `userAgent` is required and should be a string')
  }
}

module.exports = async req => {
  try {
    const {
      provider,
      providerUserId,
      deviceId,
      userAgent,
      pseudo,
      avatar,
      languages = []
    } = await json(req, { encoding: 'utf8' })
    const params = { now: Date.now(), provider, providerUserId, deviceId, userAgent }
    validateParams(params)
    const commands = [
      'MERGE (connector:Connector { provider: $provider, id: $providerUserId })',
      'ON CREATE SET connector.created = $now',
      'MERGE (device:Device { id: $deviceId, userAgent: $userAgent })',
      'ON CREATE SET device.created = $now',
      'CREATE (connector)-[:FROM { created: $now }]->(device)',
      'WITH connector',
      'OPTIONAL MATCH (user:User)-->(connector)',
      'RETURN user.id'
    ]
    const { records } = await db.run(commands.join(' '), params)
    let userId = records[0]._fields[0]
    if (!userId) {
      // Create user with default identity
      userId = generateId()
      const user = { id: userId, created: params.now, languages: languages.join(',') }
      const identity = { id: generateId(), created: params.now, pseudo, avatar }
      const commands = [
        'MATCH (connector:Connector { provider: $provider, id: $providerUserId })',
        'CREATE (user:User $user)-[:LOGGED_AS { created: $now }]->(connector)',
        'CREATE (user)-[:IS]->(:Identity $identity)'
      ]
      await db.run(commands.join(' '), { ...params, user, identity })
    }
    return getUser({ ...req, url: `/?id=${userId}` })
  } catch (error) {
    return { success: false, error: `[${error.code}] ${error.message}` }
  }
}
