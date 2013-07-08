NPM_BIN=./node_modules/.bin

lint:
	@$(NPM_BIN)/jshint modules.js
	@$(NPM_BIN)/jscs modules.js

.PHONY: lint
