#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../backend"
# Free services have no pre-deploy command. Apply committed migrations before
# listening; never run the development seed against the hosted database.
npm run prisma:deploy
exec node dist/src/server.js
