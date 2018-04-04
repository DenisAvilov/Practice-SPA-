/*
* spa.shell.js
* Модуль Chat для SPA
*/
/*jslint
     browser : true, continue : true,
     devel   : true, indent   : 2,
     maxerr  : 50,   newcap   : true,
     nomen   : true, plusplus : true,
     regexp  : true, sloppy   : true,
     vars    : false,white    : true
*/
/*global $, spa */



spa.chat = (function () {
    //--------- НАЧАЛО ПЕРЕМЕННЫХ В ОБЛАСТИ ВИДИМОСТИ МОДУЛЯ --------
     var configMap = {

             main_html : String()
         +'<div style="padding: 1em; color: #fff;">'
         +'Say heelo to chat'
         +'</div>',
             settable_map : {}
     },
     stateMap = { $container : null },
     jqueryMap = {},
     setJqueryMap, configModule, initModule;

    //--------- КОНЕЦ ПЕРЕМЕННЫХ В ОБЛАСТИ ВИДИМОСТИ МОДУЛЯ --------


    //----------------- НАЧАЛО СЛУЖЕБНЫХ МЕТОДОВ -------------------
    //------------------ КОНЕЦ СЛУЖЕБНЫХ МЕТОДОВ -------------------

    //-------------------- НАЧАЛО МЕТОДОВ DOM ----------------------
    // Начало метода DOM /setJqueryMap/

    setJqueryMap = function () {
        var $container = stateMap.$container;
        jqueryMap = { $container : $container };
       };

    // Конец метода DOM /setJqueryMap/

    //--------------------- КОНЕЦ МЕТОДОВ DOM ----------------------



    //---------------- НАЧАЛО ОБРАБОТЧИКОВ СОБЫТИЙ -----------------
    //----------------- КОНЕЦ ОБРАБОТЧИКОВ СОБЫТИЙ -----------------



    //---------------- НАЧАЛО ОТКРЫТЫХ МЕТОДОВ -----------------
    // Начало открытого метода /configModule/
    // Назначение: настроить допустимые ключи
    // Аргументы: хэш настраиваемых ключей и их значений
    // Параметры:
    // * configMap.settable_map объявляет допустимые ключи
    // Возвращает: true
    // Исключения: нет

    configModule = function ( input_map ){
        spa.util.setConfigMap({
            input_map    : input_map,
            settable_map : configMap.settable_map,
            config_map   : configMap
        });
      return true;
    };
             ///конец открытого метода configModule
             ///начало открытог метода initModule


    initModule = function(  $container ){

       $container.html( configMap.main_html );
       stateMap.$container = $container;
       setJqueryMap();
       return true;
    };
             // Конец открытого метода /initModule/

    return {
        configModule : configModule,
        initModule   : initModule
    }

    //----------------- КОНЕЦ ОТКРЫТЫХ МЕТОДОВ -----------------

})();