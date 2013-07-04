Модульная система [![Build Status](https://travis-ci.org/ymaps/modules.png?branch=master)](https://travis-ci.org/ymaps/modules)
=================

####Требования####
  1. Асинхронный require модулей
  2. Асинхронный provide модулей
  3. Возможность передекларации/додекларации модуля
  4. С учетом пункта 3, зависимости должны разрешаться в пределах одного поколения деклараций (поколение образуют декларации модулей в пределах одного тика eventloop)

####Почему не CommonJS?####
Смотри пункты 1, 2 и 3 требований

####Почему не AMD?####
Смотри пункты 2 и 3 требований

Спецификация API
----------------

####Объявление модуля####
````javascript
void modules.define(
    String moduleName,
    [Array<String> dependencies],
    Function(
        Function(Object objectToProvide) provide,
        [Object resolvedDependency, ...],
        [Object previousDeclaration]
    ) declarationFunction
)
````
####Подключение модуля####
````javascript
void modules.require(
    Array<String> dependencies,
    Function(
        [Object resolvedDependency, ...]
    ) callbackFunction
)
````

####Пример####

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
