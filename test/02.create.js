
var YM = require('../'),
    assert = require('assert');

describe('YM.create', function(){

    it('should provide interface', function () {
        assert(YM.create, 'create method not exist');
    });


    it('should provide interface for independent instance', function () {

        var ym = YM.create();
        assert(ym.define, 'define method not exist');
        assert(ym.require, 'require method not exist');
        assert(ym.getState, 'getState method not exist');
        assert(ym.isDefined, 'isDefined method not exist');
        assert(ym.setOptions, 'setOptions method not exist');

    });


    it('should create independent instance', function () {
        YM.define('X0', function (provide) { provide(1); });
        var ym = YM.create();
        assert(ym.getState('X0'), 'NOT_DEFINED');
    });


    it('should check independent instance basics', function (done) {

        var ym = YM.create();

        ym.define('X0', function (provide) { provide(1); });
        assert(ym.getState('X0'), 'NOT_RESOLVED', 'Wrong state at module definition');
        ym.require(['X0'], function (x0) {
            assert(ym.getState('X0'), 'IN_RESOLVING', 'Wrong state');
            done();
        });
        assert(ym.getState('X0'), 'RESOLVED', 'Wrong state');

        setTimeout(function () {
            if (ym.getState('X0') !== 'RESOLVED') {
                done('Definition was staled in state: ' + YM.getState('X0'));
            };
        }, 10);

    });

});
