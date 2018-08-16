const { addIndex, addUniqueConstraint } = require('./util/neo4j')

const Model = {
  User: {
    id: { unique: true, indexed: true },
    created: {},
    languages: {}
  },
  Device: {
    id: { unique: true, indexed: true },
    created: {},
    userAgent: {}
  },
  Identity: {
    id: { unique: true, indexed: true },
    created: {},
    pseudo: {},
    avatar: {},
    presentation: {},
    website: {}
  },
  Connector: {
    id: { indexed: true },
    provider: {},
    created: {}
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

module.exports = {
  Model,
  initModel
}
