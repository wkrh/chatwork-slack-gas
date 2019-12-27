#!/bin/bash

[[ -f .env ]] && source .env

curl -X GET -H "X-ChatWorkToken: $CHATWORK_TOKEN" "https://api.chatwork.com/v2/rooms/$CHATWORK_MY_ROOM/messages?force=1" | jq | less
