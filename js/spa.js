/*
* spa.js
*/
/*jslint
            * browser : true, continue : true,
            * devel   : true, indent   : 2,     maxerr   : 50,
            * newcap  : true, nomen    : true,  plusplus : true,
            * regexp  : true, sloppy   : true,  vars     :true,
            * write   :  true
*/
/* global $, spa*/

var spa = (function () {

    "use strict";

    var initModule = function ( $container ) {
           spa.model.initModule();
           spa.shell.initModule( $container);
    };

    return { initModule: initModule };

}());


