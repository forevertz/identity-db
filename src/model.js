const { addIndex, addUniqueConstraint } = require('./util/neo4j')

const Model = {
  // TODO
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
