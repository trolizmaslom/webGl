/**
 * Created by nickolaygotsliyk on 31.10.16.
 */

(function($) {

    var defaults = {

    };
    var methods = {

        init:function(params) {
            var options = $.extend({}, defaults, params);
            return this.each(function () {
                var object =  $(this);

                object.find('.chank-size').on('change', function () {
                    $(this).prev().text($(this).val());
                    createGround();
                }).prev().text($('.chank-size').val());
                object.find('.scene-sizex').on('change', function () {
                    $(this).prev().text($(this).val());
                    createGround();
                }).prev().text($('.scene-sizex').val());
                object.find('.scene-sizey').on('change', function () {
                    $(this).prev().text($(this).val());
                    createGround();
                }).prev().text($('.scene-sizey').val());
                object.find('button.left').on('mousedown', function () {
                    var interval = setInterval(function () {
                        rotateCamera(-1);
                    },10);
                    $(this).on('mouseup', function () {
                        clearInterval(interval);
                    })
                });
                object.find('button.right').on('mousedown', function () {
                    var interval = setInterval(function () {
                        rotateCamera(1);
                    },10);
                    $(this).on('mouseup', function () {
                        clearInterval(interval);
                    })
                });
                object.find('button.zoomin').on('mousedown', function () {
                    var interval = setInterval(function () {
                        zoomCamera(-1);
                    },10);
                    $(this).on('mouseup', function () {
                        clearInterval(interval);
                    })
                });
                object.find('button.zoomout').on('mousedown', function () {
                    var interval = setInterval(function () {
                        zoomCamera(1);
                    },10);
                    $(this).on('mouseup', function () {
                        clearInterval(interval);
                    })
                });
            });

        },
        getChunkSize:function () {
            return parseInt($(this).find('.chank-size').val());
        },
        getSceneSize:function () {
            var obj = {x:0,y:0};
            obj.x = parseInt($(this).find('.scene-sizex').val());
            obj.y = parseInt($(this).find('.scene-sizey').val());
            return obj;
        }


    };

    $.fn.TUI = function(method){
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Метод "' +  method + '" не найден в плагине jQuery.TUI' );
        }
    };
})(jQuery);

