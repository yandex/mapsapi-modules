/**
 * @param    {Object}    modules
 */
!function ( modules, undefined ) {
    'use strict';

    var
        /**
         * @param       {Function}  provide     Async module export
         */
        module = function ( provide ) {
            var
                /**
                 * // moduleRealization description
                 */
                moduleRealization = function() {
                    return 100;
                };
            // end of vars

            provide(moduleRealization);
        };
    // end of vars


    /**
     * @module      A
     * @version     0.1
     */
    modules.define(
        'A',    // Module name
        [],     // Dependies
        module  // Module realization
    );
}(
    ( this.hasOwnProperty('modules') ) ? this.modules : modules
);