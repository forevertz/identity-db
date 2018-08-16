const neo4j = require('neo4j-driver').v1

const onExit = require('./onExit')

const uri = process.env.NEO4J_URL || 'bolt://127.0.0.1'
const [user, password] = (process.env.NEO4J_AUTH || 'neo4j/CHANGEME').split('/')

const options = { disableLosslessIntegers: true }
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), options)
const db = driver.session()

onExit(() => {
  try {
    driver.close()
  } catch (error) {}
})

async function addIndex(label, property) {
  try {
    await db.run(`CREATE INDEX ON :${label}(${property})`)
  } catch (error) {}
}

async function addUniqueConstraint(label, property) {
  try {
    await db.run(`CREATE CONSTRAINT ON (a:${label}) ASSERT a.${property} IS UNIQUE`)
  } catch (error) {}
}

function returnData(records) {
  return records.map(({ _fields, _fieldLookup }) =>
    Object.keys(_fieldLookup).reduce(
      (acc, field, i) => ({ ...acc, [field]: i > 0 ? _fields[i] : _fields[i].properties }),
      {}
    )
  )
}

module.exports = {
  db,
  addIndex,
  addUniqueConstraint,
  returnData
}
