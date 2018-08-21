const { addIndex, addUniqueConstraint } = require('./util/neo4j')
const { FormError, isString } = require('./util/validator')

const Model = {
  Device: {
    id: { unique: true, indexed: true },
    created: {},
    userAgent: {}
  },
  Connector: {
    userId: { indexed: true },
    provider: {},
    created: {}
  },
  Identity: {
    id: { unique: true, indexed: true },
    created: {},
    key: {},
    pseudo: {},
    avatar: {},
    intro: {},
    website: {},
    languages: {}
  }
}

async function initModel() {
  for (const label of Object.keys(Model)) {
    for (const property of Object.keys(Model[label])) {
      const { unique, indexed } = Model[label][property]
      if (unique) {
        await addUniqueConstraint(label, property)
      }
      // Note: unique constraint already adds an index
      if (indexed && !unique) {
        await addIndex(label, property)
      }
    }
  }
}

function validateDevice({ id, userAgent, ...rest }) {
  if (Object.keys(rest).length > 0) {
    throw new FormError(
      `Unauthorized keys: ${Object.keys(rest)
        .map(key => `device.${key}`)
        .join(', ')}`
    )
  }
  if (!id || !isString(id, /^[A-Za-z0-9_-]+$/)) {
    throw new FormError('Parameter `device.id` is required and should be a string')
  }
  if (userAgent && !isString(userAgent, /.*/)) {
    throw new FormError('Parameter `device.userAgent` should be a string')
  }
}

function validateConnector({ provider, userId, ...rest }) {
  if (Object.keys(rest).length > 0) {
    throw new FormError(
      `Unauthorized keys: ${Object.keys(rest)
        .map(key => `connector.${key}`)
        .join(', ')}`
    )
  }
  if (!provider || !isString(provider, /^[A-Za-z0-9_-]+$/)) {
    throw new FormError('Parameter `connector.provider` is required and should be a string')
  }
  if (!userId || !isString(userId, /^[A-Za-z0-9_-]+$/)) {
    throw new FormError('Parameter `connector.userId` is required and should be a string')
  }
}

function validateIdentity({ id, key, label, pseudo, avatar, intro, website, languages, ...rest }) {
  if (Object.keys(rest).length > 0) {
    throw new FormError(
      `Unauthorized keys: ${Object.keys(rest)
        .map(key => `identity.${key}`)
        .join(', ')}`
    )
  }
  if (id && !isString(id, /^[A-Za-z0-9_+/-]+$/)) {
    throw new FormError('Parameter `identity.id` should be a string')
  }
  if (key && !isString(key, /^[A-Za-z0-9_+/-]+$/)) {
    throw new FormError('Parameter `identity.key` should be a string')
  }
  if (label && !isString(label, /^[A-Za-z0-9_+/-]+$/)) {
    throw new FormError('Parameter `identity.label` should be a string')
  }
  if (pseudo && !isString(pseudo, /^.*$/)) {
    throw new FormError('Parameter `identity.pseudo` should be a string')
  }
  if (avatar && !isString(avatar, /^https?:\/\/.*$/)) {
    throw new FormError('Parameter `identity.avatar` should be a string')
  }
  if (intro && !isString(intro, /^.*$/)) {
    throw new FormError('Parameter `identity.intro` should be a string')
  }
  if (website && !isString(website, /^https?:\/\/.*$/)) {
    throw new FormError('Parameter `identity.website` should be a string')
  }
  if (
    languages &&
    (!Array.isArray(languages) ||
      languages.reduce((nonString, value) => nonString || !isString(value, /^[A-Za-z_-]+$/), false))
  ) {
    throw new FormError('Parameter `identity.languages` and should be an array of strings')
  }
}

module.exports = {
  Model,
  initModel,
  validateIdentity,
  validateDevice,
  validateConnector
}
