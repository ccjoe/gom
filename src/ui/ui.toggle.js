define(['View'], function(View) {

    var defaults = {
        content: ['Male', 'Female']         // 暂不支持定义
    };
    /**
     * 在ios的UI里toggle里是没有文字的，在android里是有的，这里暂时按ios里UI
     * @class Gom.UI.Toggle
     * @alias Toggle
     * @extends {Gom.View}
     * @param {object} opts
     */
    var Toggle = View.extend({
        init: function (opts) {
            opts.data = _.extend({}, defaults, opts);
            opts.tmpl = '<div class="toggle"><div class="toggle-handle"></div></div>';
            opts.wrapper = opts.wrapper;
            opts.replace = true;
            $.extend(opts, this);   //将List实例混合到opts上， 去父对象上执行
            this._super(opts);
        },
        show: function(){
            var $wp = this.wrapper;
            $wp.off().on('click', '.toggle-handle', function(){
                $wp[($wp.hasClass('active') ? 'remove' : 'add') + 'Class']('active');
            });
            $wp.find('.toggle-handle').swipeLeft({
                endCallback: function(){
                    $wp.removeClass('active');
                }
            }).swipeRight({
                endCallback: function(){
                    $wp.addClass('active');
                }
            });
        }
    });

    return Toggle;
});
