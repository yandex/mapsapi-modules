
var YM = require('../'),
    assert = require('assert');

describe('YM', function(){

    it('should provide interface', function () {

        assert(YM.define, 'define method not exist');
        assert(YM.require, 'require method not exist');
        assert(YM.getState, 'getState method not exist');
        assert(YM.isDefined, 'isDefined method not exist');
        assert(YM.setOptions, 'setOptions method not exist');

    });


    it('should create context by default', function (done) {

        YM.define('X0', function (provide) { provide(1); });
        assert(YM.getState('X0'), 'NOT_RESOLVED', 'Wrong state at module definition');
        YM.require(['X0'], function (x0) {
            assert(YM.getState('X0'), 'IN_RESOLVING', 'Wrong state');
            done();
        });
        assert(YM.getState('X0'), 'RESOLVED', 'Wrong state');

        setTimeout(function () {
            if (YM.getState('X0') !== 'RESOLVED') {
                done('Definition was staled in state: ' + YM.getState('X0'));
            };
        }, 10);

    });


    it('should provide right things', function (done) {

        YM.define('X1',
            function (provide) {
                provide({foo: 'bar'});
            });

        YM.require(['X1'], function (a) {
            assert.equal(a.foo, 'bar', 'Something wrong with provided object');
            done();
        });

    });

    it('should overload modules by multple defines', function (done) {

        YM.define('X2',
            function (provide) {
                provide({foo: 'bar'});
            });
        YM.define('X2',
            function (provide, x) {
                x.baz = 'moo';
                provide(x);
            });

        YM.require(['X2'], function (x) {
            assert.equal(x.foo, 'bar');
            assert.equal(x.baz, 'moo');
            done();
        });

    });

});
