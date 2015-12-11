define(['View'], function(View) {
    var defaultBtn = {
        type: '',    //primary, positive, negative, link
        outline: false, //true/false
        icon: void 0, //icon className
        badge: void 0, //number || false
        title: ''
    };

    var Button = View.extend({
        init: function (opts) {
            opts.data = _.extend({}, defaultBtn, opts.data);
            opts.tmplname = 'ui.button';
            opts.replace = true;
            $.extend(opts, this);   //将List实例混合到opts上， 去父对象上执行
            this._super(opts);
        }
    });

    return Button;
});
