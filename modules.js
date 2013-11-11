/**
 * Modules
 *
 * Copyright (c) 2013 Filatov Dmitry (dfilatov@yandex-team.ru)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * @version 0.0.10
 */

(function(global) {

var DECL_STATES = {
        NOT_RESOLVED : 'NOT_RESOLVED',
        IN_RESOLVING : 'IN_RESOLVING',
        RESOLVED     : 'RESOLVED'
    },

    undef,

    /**
     * Creates a context
     * @returns {Object} ctx
     */
    genContext = function () {
        return {
            modulesStorage  : {},
            declsToCals     : [],
            waitForNextTick : false,
            pendingRequires : [],
            curOptions      : {
                trackCircularDependencies : true,
                allowMultipleDeclarations : true
            }
        };
    },

    /**
     * Defines module
     * @param {String} name
     * @param {String[]} [deps]
     * @param {Function} declFn
     */
    define = function(name, deps, declFn) {
        if(!declFn) {
            declFn = deps;
            deps = [];
        }

        var module = this.modulesStorage[name];
        if(module) {
            if(!this.curOptions.allowMultipleDeclarations) {
                throwMultipleDeclarationDetected(name);
                return;
            }
        }
        else {
            module = this.modulesStorage[name] = {
                name : name,
                decl : undef
            };
        }

        this.declsToCalc.push(module.decl = {
            name          : name,
            fn            : declFn,
            state         : DECL_STATES.NOT_RESOLVED,
            deps          : deps,
            prevDecl      : module.decl,
            dependOnDecls : [],
            dependents    : [],
            exports       : undef
        });
    },

    /**
     * Requires modules
     * @param {String[]} modules
     * @param {Function} cb
     */
    require = function(modules, cb) {
        if(!this.waitForNextTick) {
            this.waitForNextTick = true;
            nextTick.call(onNextTick);
        }

        this.pendingRequires.push({
            modules : modules,
            cb      : cb
        });
    },

    /**
     * Returns state of module
     * @param {String} name
     * @returns {String} state, possible values NOT_DEFINED, NOT_RESOLVED, IN_RESOLVING, RESOLVED
     */
    getState = function(name) {
        var module = this.modulesStorage[name];
        return module?
            DECL_STATES[module.decl.state] :
            'NOT_DEFINED';
    },

    /**
     * Returns whether the module is defined
     * @param {String} name
     * @returns {Boolean}
     */
    isDefined = function(name) {
        return !!this.modulesStorage[name];
    },

    /**
     * Sets options
     * @param {Object} options
     */
    setOptions = function(options) {
        for(var name in options) {
            if(options.hasOwnProperty(name)) {
                this.curOptions[name] = options[name];
            }
        }
    },

    onNextTick = function() {
        this.waitForNextTick = false;
        calcDeclDeps.call(this);
        applyRequires.call(this);
    },

    calcDeclDeps = function() {
        var i = 0, decl, j, dep, dependOnDecls;
        while(decl = this.declsToCalc[i++]) {
            j = 0;
            dependOnDecls = decl.dependOnDecls;
            while(dep = decl.deps[j++]) {
                if(!isDefined.call(this, dep)) {
                    throwModuleNotFound(dep, decl);
                    break;
                }
                dependOnDecls.push(this.modulesStorage[dep].decl);
            }

            if(decl.prevDecl) {
                dependOnDecls.push(decl.prevDecl);
                decl.prevDecl = undef;
            }
        }

        this.declsToCalc = [];
    },

    applyRequires = function() {
        var requiresToProcess = this.pendingRequires,
            require, i = 0, j, dep, dependOnDecls, applyCb;

        this.pendingRequires = [];

        while(require = requiresToProcess[i++]) {
            j = 0; dependOnDecls = []; applyCb = true;
            while(dep = require.modules[j++]) {
                if(!isDefined.call(this, dep)) {
                    throwModuleNotFound(dep);
                    applyCb = false;
                    break;
                }

                dependOnDecls.push(this.modulesStorage[dep].decl);
            }
            applyCb && applyRequire.call(this, dependOnDecls, require.cb);
        }
    },

    applyRequire = function(dependOnDecls, cb) {
        requireDecls.call(
            this,
            dependOnDecls,
            function(exports) {
                cb.apply(global, exports);
            },
            []);
    },

    requireDecls = function(decls, cb, path) {
        var unresolvedDeclCnt = decls.length;

        if(unresolvedDeclCnt) {
            var onDeclResolved,
                i = 0, decl;

            while(decl = decls[i++]) {
                if(decl.state === DECL_STATES.RESOLVED) {
                    --unresolvedDeclCnt;
                }
                else {
                    if(this.curOptions.trackCircularDependencies && isDependenceCircular(decl, path)) {
                        throwCircularDependenceDetected(decl, path);
                    }

                    decl.state === DECL_STATES.NOT_RESOLVED && startDeclResolving.call(this, decl, path);

                    decl.state === DECL_STATES.RESOLVED? // decl resolved synchronously
                        --unresolvedDeclCnt :
                        decl.dependents.push(onDeclResolved || (onDeclResolved = function() {
                            --unresolvedDeclCnt || onDeclsResolved(decls, cb);
                        }));
                }
            }
        }

        unresolvedDeclCnt || onDeclsResolved(decls, cb);
    },

    onDeclsResolved = function(decls, cb) {
        var exports = [],
            i = 0, decl;
        while(decl = decls[i++]) {
            exports.push(decl.exports);
        }
        cb(exports);
    },

    startDeclResolving = function(decl, path) {
        this.curOptions.trackCircularDependencies && (path = path.slice()).push(decl);
        decl.state = DECL_STATES.IN_RESOLVING;
        var isProvided = false;
        requireDecls(
            decl.dependOnDecls,
            function(depDeclsExports) {
                decl.fn.apply(
                    {
                        name   : decl.name,
                        deps   : decl.deps,
                        global : global
                    },
                    [function(exports) {
                        isProvided?
                            throwDeclAlreadyProvided(decl) :
                            isProvided = true;
                        provideDecl(decl, exports);
                        return exports;
                    }].concat(depDeclsExports));
            },
            path);
    },

    provideDecl = function(decl, exports) {
        decl.exports = exports;
        decl.state = DECL_STATES.RESOLVED;

        var i = 0, dependent;
        while(dependent = decl.dependents[i++]) {
            dependent(decl.exports);
        }

        decl.dependents = undef;
    },

    isDependenceCircular = function(decl, path) {
        var i = 0, pathDecl;
        while(pathDecl = path[i++]) {
            if(decl === pathDecl) {
                return true;
            }
        }
        return false;
    },

    throwException = function(e) {
        nextTick(function() {
            throw e;
        });
    },

    throwModuleNotFound = function(name, decl) {
        throwException(Error(
            decl?
                'Module "' + decl.name + '": can\'t resolve dependence "' + name + '"' :
                'Can\'t resolve required module "' + name + '"'));
    },

    throwCircularDependenceDetected = function(decl, path) {
        var strPath = [],
            i = 0, pathDecl;
        while(pathDecl = path[i++]) {
            strPath.push(pathDecl.name);
        }
        strPath.push(decl.name);

        throwException(Error('Circular dependence detected "' + strPath.join(' -> ') + '"'));
    },

    throwDeclAlreadyProvided = function(decl) {
        throwException(Error('Declaration of module "' + decl.name + '" already provided'));
    },

    throwMultipleDeclarationDetected = function(name) {
        throwException(Error('Multiple declaration of module "' + name + '" detected'));
    },

    nextTick = (function() {
        var fns = [],
            enqueueFn = function(fn) {
                return fns.push(fn) === 1;
            },
            callFns = function() {
                var fnsToCall = fns, i = 0, len = fns.length;
                fns = [];
                while(i < len) {
                    fnsToCall[i++]();
                }
            };

        if(typeof process === 'object' && process.nextTick) { // nodejs
            return function(fn) {
                enqueueFn(fn) && process.nextTick(callFns);
            };
        }

        if(global.setImmediate) { // ie10
            return function(fn) {
                enqueueFn(fn) && global.setImmediate(callFns);
            };
        }

        if(global.postMessage && !global.opera) { // modern browsers
            var isPostMessageAsync = true;
            if(global.attachEvent) {
                var checkAsync = function() {
                        isPostMessageAsync = false;
                    };
                global.attachEvent('onmessage', checkAsync);
                global.postMessage('__checkAsync', '*');
                global.detachEvent('onmessage', checkAsync);
            }

            if(isPostMessageAsync) {
                var msg = '__modules' + (+new Date()),
                    onMessage = function(e) {
                        if(e.data === msg) {
                            e.stopPropagation && e.stopPropagation();
                            callFns();
                        }
                    };

                global.addEventListener?
                    global.addEventListener('message', onMessage, true) :
                    global.attachEvent('onmessage', onMessage);

                return function(fn) {
                    enqueueFn(fn) && global.postMessage(msg, '*');
                };
            }
        }

        var doc = global.document;
        if('onreadystatechange' in doc.createElement('script')) { // ie6-ie8
            var createScript = function() {
                    var script = doc.createElement('script');
                    script.onreadystatechange = function() {
                        script.parentNode.removeChild(script);
                        script = script.onreadystatechange = null;
                        callFns();
                };
                (doc.documentElement || doc.body).appendChild(script);
            };

            return function(fn) {
                enqueueFn(fn) && createScript();
            };
        }

        return function(fn) { // old browsers
            enqueueFn(fn) && setTimeout(callFns, 0);
        };
    })(),

    bindCtx = Function.prototype.bind || function (ctx) {
        var fn = this,
            noop = function () {},
            bound = function () {
                return fn.apply(ctx, Array.prototype.slice.call(arguments));
            };
        noop.prototype = this.prototype;
        bonud.prototype = new noop();
        return bonud;
    },

    genApi = function () {
        var ctx = genContext();
        return {
            define     : bindCtx.call(define, ctx),
            require    : bindCtx.call(require, ctx),
            getState   : bindCtx.call(getState, ctx),
            isDefined  : bindCtx.call(isDefined, ctx),
            setOptions : bindCtx.call(setOptions, ctx)
        };
    },

    api = genApi();

// possibility to create multiple storages
api.create = genApi;

if(typeof exports === 'object') {
    module.exports = api;
}
else {
    global.modules = api;
}

})(this);
