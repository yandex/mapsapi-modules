Реализация модулей в рамках Яндекс.Карт
=======================================

####Синтаксис####

Объявление модуля:
```javascript
void modules.define(
    [String declarationName],
    [Array<String> dependencies],
    Function(
        Function(Object objectToProvide) provide,
        [Object resolvedDependency, ...],
        [Object previousDeclaration] // Зависит от реализации
    ) declarationFunction
)
```
Подключение модуля:
```javascript
void modules.require(
    Array<String> modules,
    Function(
        [Object resolvedDependency, ...],
    ) callbackFunction
)
```

Пример:

```javascript
modules.define(
    'A', 
    ['B', 'C'], 
    function(provide, b, c, prev) {
        var a = {};
        provide(a);
    }
);

modules.define(
    'B',
    function(provide) {
        var b = {};
        provide(b);
    }
);

modules.define(
    'C',
    ['B']
    function(provide, b) {
        var c = {};
        provide(c);
    }
);

modules.require('A', function(a) {
    // module 'A' now resolved to a
});
```
