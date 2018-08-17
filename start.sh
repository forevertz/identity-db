#!/bin/sh

# Run neo4j
exec /docker-entrypoint.sh neo4j &
sleep 5

# Run application
cd /usr/src/app
yarn start
