get-lint:
	curl -sfL https://install.goreleaser.com/github.com/golangci/golangci-lint.sh | sh -s latest

.PHONY: lint
lint:
	if [ ! -f ./bin/golangci-lint ]; then \
		$(MAKE) get-lint; \
	fi;
	./bin/golangci-lint run ./... --timeout 5m0s

install:
	@echo "  >  \033[32mInstalling cfgBuilder...\033[0m "
	go install

build:
	@echo "  >  \033[32mBuilding cfgBuilder...\033[0m "
	go build -o  build/cfgBuilder

clean:
	rm -rf build/

docker-e2e:
	docker-compose -f ./docker-compose-e2e.yml up -V