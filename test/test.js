require('chai').should();

var modules;

beforeEach(function() {
    modules = require('../modules').create();
});

describe('resolving', function() {
    it('should properly resolve dependencies by string', function(done) {
        modules.define('A', function(provide) {
            provide('A');
        });

        modules.require('A', function(A) {
            A.should.have.been.equal('A');
            done();
        });
    });

    it('should properly resolve dependencies (synchronously)', function(done) {
        modules.define('A', function(provide) {
            provide('A');
        });

        modules.define('B', ['A'], function(provide, A) {
            provide(A + 'B');
        });

        modules.define('C', ['A', 'B'], function(provide, A, B) {
            provide('C' + B + A);
        });

        modules.require(['C'], function(C) {
            C.should.have.been.equal('CABA');
            done();
        });
    });

    it('should properly resolve dependencies (asynchronously)', function(done) {
        modules.define('A', function(provide) {
            setTimeout(function() {
                provide('A');
            }, 10);
        });

        modules.define('B', ['A'], function(provide, A) {
            setTimeout(function() {
                provide(A + 'B');
            }, 10);
        });

        modules.define('C', ['A', 'B'], function(provide, A, B) {
            setTimeout(function() {
                provide('C' + B + A);
            }, 10);
        });

        modules.require(['C'], function(C) {
            C.should.have.been.equal('CABA');
            done();
        });
    });

    it('should properly resolve multiple declarations', function(done) {
        modules.define('A', function(provide) {
            provide('A1');
        });

        modules.define('A', function(provide, A) {
            provide(A + 'A2');
        });

        modules.define('A', function(provide, A) {
            provide(A + 'A3');
        });

        modules.require(['A'], function(A) {
            A.should.have.been.equal('A1A2A3');
            done();
        });
    });
});

describe('load modules', function() {
    it('should properly load module and resolve dependencies', function(done) {
        var
            modulesDep = {'A': './modules/A.js', 'B': './modules/B.js', 'C': './modules/C.js'};

        // Настраиваем поиск и загрузку незарегистрированных модулей
        modules.setOptions({
            findDep: function( moduleName ) {
                return modulesDep.hasOwnProperty(moduleName);
            },
            loadModules: function( modulesNames, callback ) {
                var
                    fs = require('fs'),
                    vm = require('vm'),
                    loadedCnt = 0,

                    // Proxy
                    originalRequire = require,
                    processProcess  = process,

                    filename, file, context, script, i;

                for(i = 0; i < modulesNames.length; i++) {
                    filename = modulesDep[modulesNames[i]];
                    (function(filename){
                        file = fs.readFile(filename, 'utf8', function(err, data) {
                            context = vm.createContext({
                                process: processProcess,
                                require: originalRequire,
                                modules: modules,
                                console: console,
                                exports: exports,
                                module: {
                                    exports: exports
                                }
                            });
                            script = vm.createScript(data, filename);
                            script.runInNewContext(context);

                            loadedCnt++;

                            if (loadedCnt === modulesNames.length) callback();
                        });
                    }(filename))
                };
            }
        });

        modules.require(['B'], function(B) {
            var res = B();
            res.should.have.been.equal(400);
            done();
        });
    });
});

describe('errors', function() {
    it('should throw error on requiring undefined module', function(done) {
        modules.isDefined('A').should.have.been.equal(false);
        modules.require(['A'], function() {}, function(e) {
            e.message.should.have.been.equal('Required module "A" can\'t be resolved');
            done();
        });
    });

    it('should throw error on depending from undefined module', function(done) {
        modules.define('A', ['B'], function(provide) {
            provide('A');
        });

        modules.define('B', ['C'], function(provide) {
            provide('B');
        });

        modules.require(['A'], function() {}, function(e) {
            e.message.should.have.been.equal('Module "B": can\'t resolve dependence "C"');
            done();
        });
    });

    it('should throw error if declaration has already been provided', function(done) {
        modules.define('A', function(provide) {
            provide('A');
            provide('A');
        });

        modules.require(['A'], function() {}, function(e) {
            e.message.should.have.been.equal('Declaration of module "A" has already been provided');
            done();
        });
    });

    it('should throw error on circular dependence', function(done) {
        modules.define('A', ['B'], function(provide) {
            provide('A');
        });

        modules.define('B', ['C'], function(provide) {
            provide('C');
        });

        modules.define('C', ['A'], function(provide) {
            provide('A');
        });

        modules.require(['A'], function() {}, function(e) {
            e.message.should.have.been.equal('Circular dependence has been detected: "A -> B -> C -> A"');
            done();
        });
    });

    it('should throw error on multiple declarations', function(done) {
        modules.setOptions({ allowMultipleDeclarations : false });

        modules.define('A', function(provide) {
            provide('A');
        });

        modules.define('A', function(provide) {
            provide('A');
        });

        modules.require(['A'], function() {}, function(e) {
            e.message.should.have.been.equal('Multiple declarations of module "A" have been detected');
            done();
        });
    });

    it('should allow to throw custom error', function(done) {
        var error = Error();

        modules.define('A', function(provide) {
            provide(null, error);
        });

        modules.require(['A'], function() {}, function(e) {
            e.should.have.been.equal(error);
            done();
        });
    });

    it('should properly restore state of modules after error of dependencies', function(done) {
        modules.define('A', ['B'], function(provide) {
            provide('A');
        });

        modules.define('B', ['C'], function(provide) {
            provide('B');
        });

        modules.require(['A'], function() {}, function() {
            modules.getState('B').should.be.equal('NOT_RESOLVED');
            modules.getState('A').should.be.equal('NOT_RESOLVED');
            done();
        });
    });

    it('should properly restore state of modules after custom error', function(done) {
        modules.define('A', ['B'], function(provide) {
            provide('A');
        });

        modules.define('B', ['C'], function(provide) {
            provide('B');
        });

        modules.define('C', function(provide) {
            provide(null, Error());
        });

        modules.require(['A'], function() {}, function() {
            modules.getState('C').should.be.equal('NOT_RESOLVED');
            modules.getState('B').should.be.equal('NOT_RESOLVED');
            modules.getState('A').should.be.equal('NOT_RESOLVED');
            modules.getState('X').should.be.equal('NOT_DEFINED');
            modules.getStat().should.to.deep.equal({
                NOT_RESOLVED: [ 'A', 'B', 'C' ]
            });
            done();
        });
    });

    it('should allow to rerequire module after error of dependencies', function(done) {
        modules.define('A', ['B'], function(provide) {
            provide('A');
        });

        modules.define('B', ['C'], function(provide) {
            provide('B');
        });

        modules.require(['A'], function() {}, function() {
            modules.define('C', function(provide) {
                provide('C');
            });
            modules.require(['A'], function() {
                done();
            });
        });
    });

    it('should allow to rerequire module after custom error', function(done) {
        modules.define('A', ['B'], function(provide, B) {
            provide('A' + B);
        });

        modules.define('B', ['C'], function(provide, C) {
            provide('B' + C);
        });

        var i = 0;
        modules.define('C', function(provide) {
            i++?
                provide('C') :
                provide(null, Error());
        });

        modules.require(['A'], function() {}, function() {
            modules.require(['A'], function(A) {
                A.should.be.equal('ABC');
                done();
            });
        });
    });

    it('should throw exception without error callback', function(done) {
        require('domain')
            .create()
            .on('error', function(e) {
                e.message.should.have.been.equal('Required module "A" can\'t be resolved');
                done();
            })
            .run(function() {
                modules.require(['A'], function() {});
            });
    });
});
