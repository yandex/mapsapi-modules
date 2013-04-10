Модульная система
=================

####Основные требования####
  1. Возможность асинхронного require модулей
  2. Возможность асинхронного provide модулей

####Дополнительные требования####
  1. Возможность декларировать под одним именем более чем одну сущность
  2. С учетом наличия пункта 1 зависимости разрешаются в пределах одного "поколения" деклараций

####Почему не CommonJS?####
Смотри пункты 1 и 2 основных требований

####Почему не AMD?####
Смотри пункт 2 основных требований

####Спецификация API####

Объявление модуля:
````javascript
void modules.define(
    String declarationName,
    [Array<String> dependencies],
    Function(
        Function(Object objectToProvide) provide,
        [Object resolvedDependency, ...],
        [Object previousDeclaration] // Зависит от реализации
    ) declarationFunction
)
````
Подключение модуля:
````javascript
void modules.require(
    Array<String> modules,
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
    ['B']
    function(provide, b) {
        var c = {};
        provide(c);
    });

modules.require(
  ['A'],
  function(a) {
    // module 'A' now resolved to a
  });
````
