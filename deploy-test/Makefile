get-lint:
	curl -sfL https://install.goreleaser.com/github.com/golangci/golangci-lint.sh | sh -s latest

.PHONY: lint build
lint:
	if [ ! -f ./bin/golangci-lint ]; then \
		$(MAKE) get-lint; \
	fi;
	./bin/golangci-lint run ./... --timeout 5m0s

test:
	go test ./...

build:
	cd cmd/ && go build -o ../build/deploy-test

docker-test:
	./docker/run_geth_and_relayers.sh