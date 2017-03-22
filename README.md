Modular system [![NPM version](https://badge.fury.io/js/ym.png)](http://badge.fury.io/js/ym) [![Build Status](https://travis-ci.org/ymaps/modules.png?branch=master)](https://travis-ci.org/ymaps/modules)
=================

[по-русски](https://github.com/ymaps/modules/blob/master/README.ru.md)

[What? Why and what for? How to
use?](https://github.com/ymaps/modules/blob/master/what-is-this.md) (ru)

#### Requirements
  1. Asynchronous require for modules
  2. Asynchronous provide for modules
  3. Extending and redefining a module

#### Why not CommonJS?
See #1, #2 and #3 in the list of requirements.

#### Why not AMD?
See #2 and #3 in the list of requirements.

API spec
----------------

#### Module declaration
````javascript
void modules.define(
    String moduleName,
    [String[] dependencies],
    Function(
        Function([Object objectToProvide], [Error error]) provide,
        [Object resolvedDependency, ...],
        [Object previousDeclaration]
    ) declarationFunction
)
````
#### Module usage
````javascript
void modules.require(
    String[] dependencies,
    Function([Object resolvedDependency, ...]) successCallbackFunction,
    [Function(Error error) errorCallbackFunction]
)
````

#### Modules storage configuration
````javascript
void setOptions(Object options)
````

##### Available options
  - `trackCircularDependencies` - if set to false doesn’t track circular dependencies. true by default
  - `allowMultipleDeclarations` - if set to false denies module overloading and provides an error. true by default

#### Get current state of module in storage
````javascript
String getState(String name)
````

##### Possible states
  - `NOT_DEFINED` - module wasn’t defined
  - `NOT_RESOLVED` - module was defined, but it hasn’t started resolving
  - `IN_RESOLVING` - resolving is in progress
  - `RESOLVED` - module is already resolved

#### Check for module existence in storage
````javascript
Boolean isDefined(String moduleName)
````

#### Create yet another modules storage
````javascript
Modules modules.create()
````

#### Example

````javascript
modules.define(
    'A',
    ['B', 'C'],
    function(provide, b, c, prev) {
        var a = {};
        provide(a);
    });

modules.define(
    'B',
    function(provide) {
        var b = {};
        provide(b);
    });

modules.define(
    'C',
    ['B'],
    function(provide, b) {
        var c = {};
        provide(c);
    });

modules.define(
    'C',
    function(provide, prevC) {
        var nextC = {};
        provide(nextC);
    });

modules.require(
  ['A'],
  function(a) {
    // module 'A' now resolved to a
  });
````
