#!/bin/bash
set -e
vercel env pull .env.local
npm run build
vercel --prod
echo "LIVE: $VERCEL_URL"
