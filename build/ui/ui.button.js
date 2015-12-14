define(['View'], function(View) {
    var defaults = {
        type: 'primary',    //primary, positive, negative, link
        outline: false, //true/false
        icon: void 0, //icon className
        badge: void 0, //number || false
        title: ''
    };
    /**
     * @class Gom.UI.Button
     * @alias Button
     * @extends {Gom.View}
     * @param {object} opts 参数列表
     * @param {object} [opts.wrapper] 组件根元素 固定值opts.replace = true 替换组件根元素wrapper
     * @param {object} [opts.data]  组件数据相关
     * @param {string} [opts.data.type='primary'] Button类型,可选有primary, positive, negative, link
     * @param {boolean} [opts.data.outline=false] 是否有外边
     * @param {string|Undefined} [opts.data.icon] icon className
     * @param {string|Undefined} [opts.data.badge] 显示小数字
     * @param {string} opts.data.title 标题
     * @example
     * <div data-ui-widget="Button" data-opts='{"type":"negative", "badge": 10, "icon": "icon-search", "isblock": true}'>Text</div>
     * 或
     * new Button({data: opts, wrapper: '.class'});
     */
    var Button = View.extend({
        init: function (opts) {
            opts.data = _.extend({}, defaults, opts.data);
            opts.tmplname = 'ui.button';
            opts.replace = true;
            $.extend(opts, this);   //将List实例混合到opts上， 去父对象上执行
            this._super(opts);
        }
    });

    return Button;
});
