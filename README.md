Modular system [![NPM version](https://badge.fury.io/js/ym.png)](http://badge.fury.io/js/ym) [![Build Status](https://travis-ci.org/ymaps/modules.png?branch=master)](https://travis-ci.org/ymaps/modules)
=================

[по-русски](https://github.com/ymaps/modules/blob/master/README.ru.md)

[What? Why and what for? How to
use?](https://github.com/ymaps/modules/blob/master/what-is-this.md) (ru)

####Requirements####
  1. Asynchronous require for modules
  2. Asynchronous provide for modules
  3. Extending and redefining a module

####Why not CommonJS?####
See #1, #2 and #3 in the list of requirements.

####Why not AMD?####
See #2 and #3 in the list of requirements.

API spec
----------------

####Module declaration####
````javascript
void modules.define(
    String moduleName,
    [String[] dependencies],
    Function(
        Function(Object objectToProvide) provide,
        [Object resolvedDependency, ...],
        [Object previousDeclaration]
    ) declarationFunction
)
````
####Module usage####
````javascript
void modules.require(
    String[] dependencies,
    Function(
        [Object resolvedDependency, ...]
    ) callbackFunction
)
````

####Example####

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
