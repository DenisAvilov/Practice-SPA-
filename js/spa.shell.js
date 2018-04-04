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
        //о
        anchor_schema_map : {
          chat : {open : true, closed : true }
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
           + '<div class="spa-shell-foot"></div>'
           + '<div class="spa-shell-chat"></div>'
           + '<div class="spa-shell-modal"></div>',
              // << Дать разработчику возможность настраивать
              //    скорость анимации и высоту окна чата >>
            chat_extend_time    : 1000,
            chat_retract_time   : 300,
            chat_extend_height  : 450,
            chat_retract_height : 15,
            chat_extended_title   : "Щелкните, чтобы свернуть",
            chat_retracted_title  : "Щелкните, чтобы раскрыть"
        },
         // Помещаем динамическую инфор-
         // мацию, доступную внутри модуля
         //  в объект stateMap.

        stateMap = {
            $container : null,
            anchor_map : {},    //Текущие значения якорей сохраняются в хэше stateMap.
            is_chat_retracted : true
        },


         //Кэшируем коллекции jQuery в объекте jqueryMap.

        jqueryMap = {},

        setJqueryMap, toggleChate, initModule,onClickChat,
       copyAnchorMap, changeAnchorPart, onHashchange; //Объявляем три дополнительных метода:

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

        jqueryMap = {
            $container: $container,
            //Кэшируем в jqueryMap коллекцию jQuery,содержащую окно чата.
            $chat : $container.find('.spa-shell-chat')

        };
    };

     // Добавляем метод toggleChat
     // «Создать единый метод сворачивания и раскрытия окна чата».

    toggleChate = function ( do_extend , callback ) {

           var
               px_chat_ht = jqueryMap.$chat.height(),
               is_open = px_chat_ht === configMap.chat_extend_height,
               is_closed = px_chat_ht === configMap.chat_retract_height,
               is_sliding = !is_open && !is_closed;


           //«Избежать гонки – ситуации, когда окно чата одновременно сворачивается и раскрывается»

           if (is_sliding) { return false };

           //Начало открытия чата

           if ( do_extend ){
              jqueryMap.$chat.animate(
                  { height : configMap.chat_extend_height },
                  configMap.chat_extend_time,

                 function () {
                      jqueryMap.$chat.attr(
                          'title', configMap.chat_extended_title
                      );
                     stateMap.is_chat_retracted = false;
                      if(callback){ callback( jqueryMap.$chat ); }
                  }
              );
              return true;
           }
           // конец открытия чата
           // начало сворачивания окна чата

           jqueryMap.$chat.animate(
               { height : configMap.chat_retract_height},
               configMap.chat_retract_time,
              function (){
                   jqueryMap.$chat.attr(
                       'title', configMap.chat_retracted_title);

                   stateMap.is_chat_retracted = true;

                  if(callback){callback( jqueryMap.$chat );}
              }
           );
            return true;
           // Конец сворачивания окна чата

       };
           // Конец метода toggleChat


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
            $.uriAnchor.setAnchor( stateMap.anchor_map.null,true );
            bool_return = false;
        }
        return bool_return;
    };

    //--------------------- КОНЕЦ МЕТОДОВ DOM ----------------------


    //---------------- НАЧАЛО ОБРАБОТЧИКОВ СОБЫТИЙ -----------------

   onClickChat = function( event ) {

       changeAnchorPart({
           chat: ( stateMap.is_chat_retracted ? 'open' : 'closed' )
       });
       return false;


/*
        if(toggleChate( stateMap.is_chat_retracted )){
            $.uriAnchor.setAnchor({
                chat : ( stateMap.is_chat_retracted ? 'open' : 'closed' )
            });
        }
        return true;
*/
   };

    onHashchange = function (event) {
       var
        anchor_map_previous = copyAnchorMap(),
        anchor_map_proposed,
        _s_chat_previous, _s_chat_proposed,
        s_chat_proposed;

        try { anchor_map_proposed = $.uriAnchor.makeAnchorMap(); }
        catch  ( error ){
            $.uriAnchor.setAnchor( anchor_map_previous, null, true );
            return false;
        }
         stateMap.anchor_map = anchor_map_proposed;
        // вспомогательные переменные
        _s_chat_previous = anchor_map_previous._s_chat;
        _s_chat_proposed = anchor_map_proposed._s_chat;
        // Начало изменения компонента Chat
         if( ! anchor_map_previous || _s_chat_previous !== _s_chat_proposed){
             s_chat_proposed = anchor_map_proposed.chat;
             switch  ( s_chat_proposed ){
                 case 'open' :
                     toggleChate( true );
                     break;
                 case  'closed' :
                     toggleChate( false );
                     break;
                 default :
                     toggleChate( false );
                     delete anchor_map_proposed.chat;
                     $.uriAnchor.setAnchor( anchor_map_proposed, null, true );

             }
         }
        // Конец изменения компонента Chat
        return false;

    }

    //----------------- КОНЕЦ ОБРАБОТЧИКОВ СОБЫТИЙ -----------------

    //------------------- НАЧАЛО ОТКРЫТЫХ МЕТОДОВ ------------------
    initModule = function ($container) {
        // Загрузить HTML и кэшировать jQuery
        stateMap.$container = $container;
        $container.html(configMap.main_html);
        setJqueryMap();

        stateMap.is_chat_retracted = true;
        jqueryMap.$chat.attr( 'title', configMap.chat_retracted_title ).click( onClickChat );

        $.uriAnchor.configModule({

          //  Конфигурируем подключаемый модуль uriAnchor для проверки по схеме.
            schema_map : configMap.anchor_schema_map

        });

        spa.chat.configModule( {} );
        spa.chat.initModule( jqueryMap.$chat );



        $(window)
             .bind( 'hashchange', onHashchange ) //onHashchange
             .trigger( 'hashchange' );

        // тестировать переключение
        // setTimeout( function () { toggleChate ( true ); }, 3000 );
        // setTimeout( function () { toggleChate ( false );}, 8000 );
    };

        return { initModule : initModule };


})();

//стр 159 - 160 алгоритм spa