.PHONY: *
.DEFAULT_GOAL:=help

help:
	@echo "Commands available"
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' | sed -e 's/^/ /' | sort

## build: Build smart contracts
# https://tealscript.netlify.app/docs/tutorials/hello_world/artifacts
build:
	npx tealscript contracts/algo-did.algo.ts contracts/artifacts
	npx algokitgen generate -a contracts/artifacts/AlgoDID.json -o contracts/algo-did-client.ts

## lint: Run style checks
lint:
	npx eslint . --ext .ts

## test: Test smart contracts
test:
	npx jest

## deploy: Deploy smart contracts
network?="local"
deploy:
	npx ts-node src/deploy.ts $(network)

## run-provider: Start the storage provider server
run-provider:
	docker run -p 3000:3000 -it --rm algo-did-provider

## build-provider: Build the DID provider image
build-provider:
	docker build -t algo-did-provider storage-provider/.
