Реализация модулей в рамках Яндекс.Карт
=======================================

Синтаксис:

```javascript
void declare(
    [String declarationName],
    Array<String> dependencies,
    Function(
        Function provide,
        [Object resolvedDependency, ...],
        [Object previousDeclaration] // Зависит от реализации
    ) declarationFunction
)
```

Пример:

```javascript
declare(
    'A', 
    ['B', 'C'], 
    function (provide, b, c, prev) {
        var a = {};
        provide(a);
    }
);
```
