const { send } = require('micro')

const { initModel } = require('./model')

process.env.TZ = 'UTC'
initModel()

const endpoints = {
  GET: {
    '/': {
      description: 'List all API endpoints',
      call: () => {
        const { name, version, description, repository, license } = require('../package.json')
        return { name, version, description, repository, license, endpoints }
      }
    },
    '/time': {
      description: 'Get server time (ISO 8601)',
      call: require('./endpoint/get-time')
    },
    '/identity': {
      description: 'Find an Identity',
      call: require('./endpoint/get-identity')
    },
    '/identities': {
      description: 'Get all Identities linked to a Connector',
      call: require('./endpoint/get-identities')
    }
  },
  POST: {
    '/connector': {
      description: 'Add Connector information and get associated Identities',
      call: require('./endpoint/post-connector')
    },
    '/identity': {
      description: 'Add or update an Identity',
      call: require('./endpoint/post-identity')
    }
  }
}

async function checkRequest(request, response, endpoints) {
  // Endpoint existance
  if (!endpoints[request.method] || !endpoints[request.method][request.pathname]) {
    return send(response, 404, { success: false, error: 'Not found' })
  }
  if (request.method === 'POST') {
    // JSON content type
    const acceptedContentTypes = ['application/json', 'application/json; charset=utf-8']
    if (!acceptedContentTypes.includes(request.headers['content-type'])) {
      return send(response, 400, {
        success: false,
        error: `Header "Content-Type" should be one of "${acceptedContentTypes.join('", "')}"`
      })
    }
  }
  return true
}

module.exports = async (request, response) => {
  request.pathname = request.url.split('?')[0]
  if (await checkRequest(request, response, endpoints)) {
    return endpoints[request.method][request.pathname].call(request, response)
  }
}
