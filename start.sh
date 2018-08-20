#!/bin/sh

# Run neo4j
exec /docker-entrypoint.sh neo4j &
sleep 5

# Run application
cd /usr/src/app
NEO4J_URL=bolt://127.0.0.1:7687 yarn start
