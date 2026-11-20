#!/usr/bin/env bash
set -euo pipefail

mkdir -p reports/mobile
./node_modules/.bin/appium --address 127.0.0.1 --port 4723 --base-path / --log reports/mobile/appium-server.log &
appium_pid=$!
trap 'kill "$appium_pid" 2>/dev/null || true' EXIT

for attempt in $(seq 1 60); do
  if curl --fail --silent http://127.0.0.1:4723/status > /dev/null; then
    break
  fi
  sleep 2
done

if ! curl --fail --silent http://127.0.0.1:4723/status > /dev/null; then
  cat reports/mobile/appium-server.log
  exit 1
fi

npm run test:mobile:native
