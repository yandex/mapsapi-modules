Модульная система YModules [![NPM version](https://badge.fury.io/js/ym.png)](http://badge.fury.io/js/ym) [![Build Status](https://travis-ci.org/ymaps/modules.png?branch=master)](https://travis-ci.org/ymaps/modules)
=================

[Что это? Зачем и для кого? Как пользоваться?](https://github.com/ymaps/modules/blob/master/what-is-this.md)

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
    [String[] dependencies],
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
    String[] dependencies,
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

####Дополнение к YModules####

В дополнение сделана возможность обработать возможность догрузки модуля по имени, если такого модуля в системе не зарегистированно. В функцию loadModules будет передан массив имен модулей, которые необходимо загрузить. После того как все модули будут загружены, необходимо вызвать функцию обратного вызова.

````javascript
modules.setOptions({
    /**
     * Функция поиска модуля
     *
     * @param  {String}     moduleName  Имя модуля, который не зарегистирован в системе
     * @return {Boolean}                Можно ли этот модуль загрузить
     */
    findDep: function( moduleName ) {
        // body...
    },
    /**
     * Функция срабатывает, если функция findDep вернула true.
     *
     * @param       {Array}     moduleNames     Массив имен модулей, которые необходимо загрузить
     * @param       {Function}  callback        Функция обратного вызова
     */
    loadModules: function( moduleName, callback ) {
        // body...
    }
});
````

####Пример с загрузкой модуля####

Допустим, у нас есть внешняя утилита, которая умеет составлять объекты соотвествия имен модулей файлам в которых они находятся. В качестве загрузчка используется [LAB.js](http://labjs.com/).

````javascript
var modulesDep = {"storage":"core.js", "menu": "ui.js"};

// Настройки LAB.js
$LAB.setGlobalDefaults({
    AllowDuplicates: false,
    AlwaysPreserveOrder: true,
    UseLocalXHR: false,
    BasePath: '/javascripts/'
});

// Настраиваем поиск и загрузку незарегистрированных модулей
modules.setOptions({
    findDep: function( moduleName ) {
        return modulesDep.hasOwnProperty(moduleName);
    },
    loadModules: function( modulesNames, callback ) {
        var
            loadedCnt = 0,
            filename,
            i;
        // end of vars

        for ( i = 0; i < modulesNames.length; i++ ) {
            filename = modulesDep[modulesNames[i]];

            (function(f) {
                $LAB.script( getWithVersion(f) ).wait(function() {
                    loadedCnt++;

                    if (loadedCnt === modulesNames.length) callback();
                });
            }(filename));
        }
    }
});


modules.require(
    ['storage'],
    function( s ) {
        // module 'storage' now resolved to 's'
    });
````
