NPM_BIN=./node_modules/.bin

lint:
	@$(NPM_BIN)/jshint modules.js
	@$(NPM_BIN)/jscs modules.js

.PHONY: lint

.PHONY: test
test:
	@$(NPM_BIN)/mocha -u bdd -R spec --recursive