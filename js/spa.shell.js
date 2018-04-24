/*
* spa.shell.js
* Модуль Shell для SPA
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

spa.shell =  (function () {
    var
        configMap = {

        anchor_schema_map : {
          chat : {opened : true, closed : true }
        },
           main_html : String()
           + '<div class="spa-shell-head">'
           + ' <div class="spa-shell-head-logo"></div>'
           + ' <div class="spa-shell-head-acct"></div>'
           + ' <div class="spa-shell-head-search"></div>'
           + '</div>'
           + '<div class="spa-shell-main">'
           + ' <div class="spa-shell-main-nav"></div>'
           + ' <div class="spa-shell-main-content"></div>'
           + '</div>'
           + '<div class="spa-shell-foot"></div>',

            resize_interval : 200,

        },
         // Помещаем динамическую инфор-
         // мацию, доступную внутри модуля
         //  в объект stateMap.

        stateMap = {
          $container : undefined,
          anchor_map : {},    //Текущие значения якорей сохраняются в хэше stateMap.
          resize_idto : undefined
          //is_chat_retracted : true
        },


         //Кэшируем коллекции jQuery в объекте jqueryMap.

        jqueryMap = {},

        setJqueryMap,  initModule,setChatAnchor,
       copyAnchorMap, changeAnchorPart, onHashchange, onResize; //Объявляем три дополнительных метода:

    //--------- КОНЕЦ ПЕРЕМЕННЫХ В ОБЛАСТИ ВИДИМОСТИ МОДУЛЯ --------

    //----------------- НАЧАЛО СЛУЖЕБНЫХ МЕТОДОВ -------------------
    /*
       В секцию «Служебные методы» помещаются функции,
       которые не взаимодействуют с элементами страницы.

       Используем метод jQuery extend() для копирования объекта.
       Это необходимо, потому что в JavaScript все объекты передаются
       по ссылке, и правильное копирование объекта – нетривиальная задача

    */
    //  ЯКОРЬ URL copyAnchorMap стр 135
    copyAnchorMap = function () {
        return $.extend( true, {}, stateMap.anchor_map );
    };
    //------------------ КОНЕЦ СЛУЖЕБНЫХ МЕТОДОВ -------------------

    //-------------------- НАЧАЛО МЕТОДОВ DOM ----------------------
    /*
      помещаються функции которые создают элементы на стронице и манипулируют ими
     */

    setJqueryMap = function () {
        var $container = stateMap.$container;

        jqueryMap = { $container: $container };
    };


    changeAnchorPart = function (arg_map){
        var
           anchor_map_revise = copyAnchorMap(),
           bool_return = true,
           key_name, key_name_dep;

        KEYVAL:
        for ( key_name in arg_map){
            if( arg_map.hasOwnProperty( key_name )){
                //пропустить зависимые ключи
                if ( key_name.indexOf( '_' ) === 0) { continue KEYVAL;}
                // обновить значение независимого ключа
                anchor_map_revise[key_name] = arg_map[key_name];
                // обновить соответствующий зависимый ключ
                key_name_dep = '_' + key_name;
                if ( arg_map[key_name_dep] ){
                    anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
                }
                else {
                    delete anchor_map_revise[key_name_dep];
                    delete anchor_map_revise['_s' + key_name_dep];
               }
            }
        }
        // Конец объединения изменений в хэше якорей
        // Начало попытки обновления URI; в случае ошибк
        // восстановить исходное состояние
        try {
            $.uriAnchor.setAnchor( anchor_map_revise );

        }
        catch ( error ){

            $.uriAnchor.setAnchor( stateMap.anchor_map, null, true );
            bool_return = false;
        }


        return bool_return;

    };

    //--------------------- КОНЕЦ МЕТОДОВ DOM ----------------------


    //---------------- НАЧАЛО ОБРАБОТЧИКОВ СОБЫТИЙ -----------------



    onHashchange = function (event) {
       var
           _s_chat_previous, _s_chat_proposed, s_chat_proposed,
           anchor_map_proposed,
           is_ok = true,
           anchor_map_previous = copyAnchorMap();

// пытаемся разобрать якорь

        try { anchor_map_proposed = $.uriAnchor.makeAnchorMap();

        }

        catch  ( error ){
            $.uriAnchor.setAnchor( anchor_map_previous, null, true );
            return false;
        }

        for(var key in anchor_map_proposed){
            console.log(anchor_map_proposed[key])
        };

         stateMap.anchor_map = anchor_map_proposed;
        // вспомогательные переменные
        _s_chat_previous = anchor_map_previous._s_chat;
        _s_chat_proposed = anchor_map_proposed._s_chat;
        // Начало изменения компонента Chat
         if( ! anchor_map_previous || _s_chat_previous !== _s_chat_proposed){
             s_chat_proposed = anchor_map_proposed.chat;
             switch  ( s_chat_proposed ){
                 case 'opened' :
                     is_ok = spa.chat.setSliderPosition( 'opened' );
                     break;
                 case  'closed' :
                     is_ok = spa.chat.setSliderPosition( 'closed' );
                     break;
                 default :
                     spa.chat.setSliderPosition( 'closed' );
                   //  toggleChat( false );
                     delete anchor_map_proposed.chat;
                     $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
             }
         }
        if ( ! is_ok ){
            if ( anchor_map_previous ){
                $.uriAnchor.setAnchor( anchor_map_previous, null, true );
                stateMap.anchor_map = anchor_map_previous;
            } else {
                delete anchor_map_proposed.chat;
                $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
            }
        }
        // Конец изменения компонента Chat
        return false;

    }

    onResize = function () {
        if (stateMap.resize_idto) {
            return true;
        }
        spa.chat.handleResize();
        stateMap.resize_idto = setTimeout(
            function () {
                stateMap.resize_idto = undefined;
            },
            configMap.resize_interval
        );
        return true;
    };


    //----------------- КОНЕЦ ОБРАБОТЧИКОВ СОБЫТИЙ -----------------
    //---------------- НАЧАЛО ОБРАТНЫХ ВЫЗОВОВ -----------------

    setChatAnchor = function ( position_type ){
        return changeAnchorPart({ chat : position_type });
    };

    //----------------- КОНЕЦ ОБРАТНЫХ ВЫЗОВОВ -----------------



    //------------------- НАЧАЛО ОТКРЫТЫХ МЕТОДОВ ------------------

    initModule = function ($container) {
        // Загрузить HTML и кэшировать jQuery
        stateMap.$container = $container;
        $container.html(configMap.main_html);
        setJqueryMap();

      //  stateMap.is_chat_retracted = true;
      //  jqueryMap.$chat.attr( 'title', configMap.chat_retracted_title ).click( onClickChat );

        $.uriAnchor.configModule({

          //  Конфигурируем подключаемый модуль uriAnchor для проверки по схеме.
            schema_map : configMap.anchor_schema_map

    });
        spa.chat.configModule({
            set_chat_anchor : setChatAnchor,
            chat_model      : spa.model.chat,
            people_model    : spa.model.people
    });
        spa.chat.initModule( jqueryMap.$container );

        $(window)

             .bind( 'hashchange', onHashchange ) //Вызов bind часто используют для привязки функции к контексту, чтобы затем присвоить её в обычную переменную и вызывать уже без явного указания объекта.
             .bind( 'resize', onResize )         //Привязываем событие window.resize.
             .trigger( 'hashchange' );


    };
        return { initModule : initModule };

})();