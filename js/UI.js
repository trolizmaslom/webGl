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
                
                object.find('button.left').on('mousedown', function () {
                    var interval = setInterval(function () {
                        rotateCamera(-1);
                    },10);
                    function handler() {
                        clearInterval(interval);
                    }
                    $(this).on('mouseleve', handler);
                    $(document).on('mouseup', 'body', handler);

                });
                object.find('button.right').on('mousedown', function () {
                    var interval = setInterval(function () {
                        rotateCamera(1);
                    },10);
                    function handler() {
                        clearInterval(interval);
                    }
                    $(this).on('mouseup', handler);
                    $(document).on('mouseup', 'body', handler);
                });
                object.find('button.zoomin').on('mousedown', function () {
                    var interval = setInterval(function () {
                        zoomCamera(-1);
                    },10);
                    function handler() {
                        clearInterval(interval);
                    }
                    $(this).on('mouseleve', handler);
                    $(document).on('mouseup', 'body', handler);
                });
                object.find('button.zoomout').on('mousedown', function () {
                    var interval = setInterval(function () {
                        zoomCamera(1);
                    },10);
                    function handler() {
                        clearInterval(interval);
                    }
                    $(this).on('mouseleve', handler);
                    $(document).on('mouseup', 'body', handler);
                });
                object.find('button.up').on('mousedown', function () {
                    var interval = setInterval(function () {
                        upDownCamera(1);
                    },10);
                    function handler() {
                        clearInterval(interval);
                    }
                    $(this).on('mouseleve', handler);
                    $(document).on('mouseup', 'body', handler);
                });
                object.find('button.down').on('mousedown', function () {
                    var interval = setInterval(function () {
                        upDownCamera(-1);
                    },10);
                    function handler() {
                        clearInterval(interval);
                    }
                    $(this).on('mouseleve', handler);
                    $(document).on('mouseup', 'body', handler);
                });
            });

        },
        getChunkSize:function () {
            return parseInt($(this).find('.chank-size').val());
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

