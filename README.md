# IdentityDB

A graph database service to store user identities and connectors.

<a href="https://github.com/forevertz/identity-db/blob/master/LICENSE"><img alt="license" src="https://img.shields.io/badge/license-GPL--3.0_License-blue.svg?style=flat" /></a>

## Concepts

- There are 3 types of nodes : `Identities`, `Devices`, and `Connectors`.

- Model:

  - `Identity`: id, key, pseudo, avatar, intro, website, languages
  - `Device`: id, userAgent
  - `Connector`: provider (OAuth providers or else), userId

- Links:

  - `(connector)-[:FROM { created }]->(device)` (N-N relashionship ; a user logged in with a given provider from a device on a given date)
  - `(connector)-[:VOUCHES_FOR]->(identity)` (1-N relashionship ; an identity is linked to a user id from a provider)
  - `(identity)-[:REPRESENTS]->(identity)` (N-1 relashionship ; an identity can be created to represent another identity) - _not yet implemented_

## Getting started

### Development

```shell
$ git clone https://github.com/forevertz/identity-db.git
$ cd identity-db
$ yarn install
$ yarn run dev
```

### Production

```shell
$ git clone https://github.com/forevertz/identity-db.git
$ cd identity-db
$ # Edit password in docker-compose.yml
$ docker-compose up -d
# Your API is now running locally on http://127.0.0.1:3000
# Recommended: install a reverse proxy to handle authentification and authorizations
```

## API

- _**GET** /identity_: Find an Identity
- _**GET** /identities_: Get all Identities linked to a Connector
- _**POST** /connector_: Add Connector information and get associated Identities
- _**POST** /identity_: Add or update an Identity

### Examples

<details><summary>GET /identity</summary><p>

```bash
$ curl http://127.0.0.1:3000/identity?id=my-user-id-1
$ curl http://127.0.0.1:3000/identity?key=my-public-key

{
  "success": true,
  "result": {
    "identity": {
      "id": "my-identity-id",
      "created": 1534249561246,
      "key": "my-public-key",
      "pseudo": "Alice",
      "label": "Public",
      "avatar": "https://...",
      "languages": "en,fr,es"
    }
  }
}

# OR (if no result)
{
  "success": true,
  "result": null
}
```

</p></details>

<details><summary>GET /identities</summary><p>

```bash
$ curl http://127.0.0.1:3000/identities?provider=google&userId=XXX

{
  "success": true,
  "result": [{
    "id": "my-identity-id",
    "created": 1534249561246,
    "key": "my-public-key",
    "pseudo": "Alice",
    "label": "Public",
    "avatar": "https://...",
    "languages": "en,fr,es"
  }]
}

# OR (if no result)
{
  "success": true,
  "result": []
}
```

</p></details>

<details><summary>POST /connector</summary><p>

```bash
# Connect with Google auth
$ curl --request POST \
       --header "Content-Type: application/json" \
       --data '{ "connector": { "provider": "google", "userId": "XXX" }, "device": { "id": "my-device-id", "userAgent": "..." } }' \
       http://127.0.0.1:3000/connector
```

</p></details>

<details><summary>POST /identity</summary><p>

```bash
# Create Alice's identity
$ curl --request POST \
       --header "Content-Type: application/json" \
       --data '{ "connector": { "provider": "google", "userId": "XXX" }, "identity": { "id": "my-identity-id", "key": "my-public-key", "pseudo": "Alice" } }' \
       http://127.0.0.1:3000/identity

# Update Alice's identity
$ curl --request POST \
       --header "Content-Type: application/json" \
       --data '{ "connector": { "provider": "google", "userId": "XXX" }, "identity": { "id": "my-identity-id", "pseudo": "Alice2" } }' \
       http://127.0.0.1:3000/identity
```

</p></details>

## LICENSE

<a href="https://github.com/forevertz/identity-db/blob/master/LICENSE"><img alt="license" src="https://img.shields.io/badge/license-GPL--3.0_License-blue.svg?style=flat" /></a>

This project is based on neo4j, which is [licensed under GPL v3](https://neo4j.com/licensing/).
