#!/usr/bin/env bash
docker build --tag ts-server:latest . && docker run -p 8002:8002 -it ts-server:latest
