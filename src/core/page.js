define(['View', 'UI'], function(View, UI){
    /**
     * page.js相关
     * 1. 页面转场相关
     * 2. 自动初始化页面，在此基础上可以定义ctrl去获取数据与改变数据结构再渲染页面
     * 3. 支持声明式组件写法
     * 4. 页面SEO相关的设置
     * @extend View
     * @clsss Page
     * @example
     **/

    var Page = View.extend({
        init:function (opts) {
            opts.wrapper = opts.wrapper || opts.config.selector.wrapper || '#viewport';
            this.title  = opts.title || '';
            this.widgets = [];                  //页面上所有经过声明式的组件对象数组， 函数式的在ctrl里可以直接引用
            this.params = opts.params || null;  //页面参数
            this.seo = opts.seo || {
                    title: '',
                    keywords: '',
                    description: ''
                };
            this.isback = opts.isback;
            this._super(opts);
            this.config = opts.config;
        },

        render: function () {
            //没有指定this.tmplname先渲染空页面,由ctrl及组件去填充页面
            if(!this.tmplname){
                this.tmpl = '<div class="'+ (this.config.selector.content.substring(1) || "content") +'"></div>';
                this.show();
                return;
            }
            //指定了this.tmplname时获取页面模板
            this.show();
        },

        show: function(){
            this.push(this.getHTMLFragment('view'), !this.isback ? 'swipe-left':'swipe-right');
            //this._parseEvent();
            if (this.title) {
                this.setHeader();
            }
            this.initWidgetUI();
        },
        //渲染页面后自动实例化组件，去支持声明式初始UI组件
        initWidgetUI: function(){
            var $t, uitype, that = this;
            $('body').find('[data-ui-widget]').each(function(i, it){
                $t = $(it);
                uitype = $t.data('ui-widget');

                that.widgets[i] = new UI[uitype]({
                    wrapper: $t,
                    data: $.extend({}, $t.data('opts'), {title: $t.text()})
                });
                that.widgets[i].render();
                $t.data('widget', that.widgets[i]);
            });
        },
        /**
         * 设置heaer
         * @method Page#PUSH
         * @param {dom} dom 推入的html
         * @param {effect} swipe-left, swipe-rigth, swipe-top, swipe-bottom 推入的html
         * 保留最近的二个页面
         **/
        push: function(dom, effect){
            var $dc = $(this.wrapper ? this.wrapper : '#viewport');
                $dc.append(dom);
            var $dcct = $dc.find('.content');
            if($dcct.length > 2){
                $dcct.eq(0).remove();
            }

            if(!effect){    //如果没有效果直接放进去

            }else{
                var xy = /left|right/.test(effect) ? 'X' : 'Y',
                    val = /left|top/.test(effect) ? '100%' : '-100%',
                    effcss = 'translate'+xy+'('+val+')';

                if(/swipe-/.test(effect)){
                    $dcct.last().css({'transform': effcss})
                        .animate({
                            translateX: '0',
                            translate3d: '0,0,0'
                        }, 300, 'ease-out');
                    return;
                }
            }
        },
        /**
         * 设置heaer
         * @method App#setHeader
         * @param {string} title 标题
         * @param {object} opts
         * @props opts.types 头部类型， 有左右按钮型， 左右链接型， tab型
         * @props opts.subTitle 副标题
         * @props opts.left  header左侧 文字或html
         * @props opts.right header右侧 文字或html
         * @props opts.html  header右侧 文字或html
         * @return {object} CRO (Current Router Object)返回具体路由指向的路由表对象
         */
        setHeader: function () {
            //alert(this.title);
            $('header.bar .title').text(this.title);
        },
        setSeo: function(seoInfo){

        }
    });
    return Page;
});
