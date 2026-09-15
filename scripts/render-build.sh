#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npm --prefix backend ci --include=dev
npm --prefix backend run prisma:generate
npm --prefix backend run build
npm --prefix frontend/desktop ci --include=dev
VITE_API_BASE_URL=/api npm --prefix frontend/desktop run build
