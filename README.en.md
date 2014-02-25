Modular system [![NPM version](https://badge.fury.io/js/ym.png)](http://badge.fury.io/js/ym) [![Build Status](https://travis-ci.org/ymaps/modules.png?branch=master)](https://travis-ci.org/ymaps/modules)
=================

####Requirements####
  1. Asynchronous module require; 
  2. Asynchronous module provide;
  3. Possibility to define and re-define modules;
  4. Taking into account 3rd point, dependencies should resolve within one declaration's generation 
  (modules declarations create a generation within the one tick of eventloop)

####Why not CommonJS?####
See requirements 1, 2 and 3 

####Why not AMD?####
See requirements 2 and 3 

API Specification
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
####Module require####
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
