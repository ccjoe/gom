define(['View'], function(View) {
    /**
     * @default
     * @prop left, right
     * @prop title, subtitle, text, 分别为主标题，副标题， text为left,right对象才有的属性，显示icon|button|link的文本
     * @prop type可以为 icon button link,
     * @prop icon: 为icon时有此属性
     */
    var defaultHeader = {
        left:{
            type: 'icon'   //options button,link
        },
        right:{
            type: 'icon',
            icon: 'icon-bars'
        },
        title: '',
        subtitle: ''
    };
    var Header = View.extend({
        init: function (opts) {
            opts.data = _.extend({}, defaultHeader, opts.data);
            opts.tmplname = 'ui.header';
            opts.wrapper = opts.wrapper || opts.config.selector.header;
            $.extend(opts, this);   //将List实例混合到opts上， 去父对象上执行
            this._super(opts);
            this.title = opts.title;
        },
        setTitle: function(text){
            this.data.title = text;
            this.update();
        },
        events: {
            'click .icon-left-nav': 'goBack'
        },
        goBack: function(){
            History.go(-1);
            return;
        }
    });

    return Header;
});
