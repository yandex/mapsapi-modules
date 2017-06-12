/**
 * @param    {Object}    modules
 */
!function ( modules, undefined ) {
    'use strict';

    var
        /**
         * @param       {Function}  provide     Async module export
         */
        module = function ( provide, A, C ) {
            var
                resultA = A(),
                resultC = C(),

                /**
                 * // moduleRealization description
                 */
                moduleRealization = function() {
                    return 100 + resultA + resultC;
                };
            // end of vars

            provide(moduleRealization);
        };
    // end of vars


    /**
     * @module      B
     * @version     0.1
     */
    modules.define(
        'B',        // Module name
        ['A', 'C'], // Dependies
        module      // Module realization
    );
}(
    ( this.hasOwnProperty('modules') ) ? this.modules : modules
);