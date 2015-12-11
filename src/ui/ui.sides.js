define(['View','Fx'], function(View) {
    /**
     * @default
     * @prop position left, right
     * @prop content, sides的内容
     */
    var defaultBtn = {
        position: 'left',   //left or right
        content: ''         // string or html
    };

    var Sides = View.extend({
        init: function (opts) {
            opts.data = _.extend({}, defaultBtn, opts.data);
            opts.tmplname = 'ui.sides';
            opts.wrapper = opts.wrapper || '#sides';
            $.extend(opts, this);   //将List实例混合到opts上， 去父对象上执行
            this._super(opts);
        },
        events:{
            'click .sides-overlay': 'hide'
        },
        getSides: function(){
            return  this.wrapper.find('.sides');
        },
        getOverlay: function(){
            return  this.wrapper.find('.sides-overlay');
        },
        setContent: function(){
          this.getSides().html(this.content);
        },

        show: function(){
            this.getOverlay().css('visibility', 'visible');

            var fxprops = {};
            fxprops[this.data.position] = 0;
            this.showed = true;
            this.getSides().fx(fxprops, 500, 'easeOutCirc');
        },
        hide: function(){
            var that = this;
            var side = this.getSides();
            var fxprops = {};
                fxprops[this.data.position] = -side.width();
            this.showed = false;
            side.fx(fxprops, 500, 'easeOutCirc', function(){
                that.getOverlay().css('visibility', 'hidden');
            });
        }
    });

    return Sides;
});
