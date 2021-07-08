SOL_URL=https://github.com/ChainSafe/chainbridge-solidity
SOL_VERSION="v1.0.0"

SOL_OPTIMISM_URL=https://github.com/viatrix/chainbridge-solidity
SOL_OPTIMISM_BRANCH=viatrix/optimism

fetch-contracts:
	@echo " > \033[32mFetching chainbridge-solidity contracts... \033[0m "
	# git clone ${SOL_URL} && cd chainbridge-solidity && git checkout ${SOL_VERSION}
	git clone ${SOL_URL} && cd chainbridge-solidity

fetch-contracts-optimism:
	@echo " > \033[32mFetching chainbridge-solidity optimism contracts... \033[0m "
	mkdir -p optimism
	cd optimism && git clone ${SOL_OPTIMISM_URL} -b ${SOL_OPTIMISM_BRANCH} && cd chainbridge-solidity

compile:
	cd chainbridge-solidity && npm install && npx truffle compile

compile-optimism:
	cd optimism/chainbridge-solidity && npm install && npx hardhat compile --network optimism

install: fetch-contracts compile
	@echo " > \033[32mInstalling cb-sol-cli... \033[0m "
	npm link .

install-optimism: fetch-contracts-optimism compile-optimism
	@echo " > \033[32mInstalling cb-sol-cli... \033[0m "
	npm link .

clean:
	rm -rf chainbridge-solidity/