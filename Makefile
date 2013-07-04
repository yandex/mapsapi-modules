NPM_BIN=./node_modules/.bin

lint:
	@$(NPM_BIN)/jshint modules.js

.PHONY: lint
