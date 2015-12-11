define(['Store', 'UITmpl'], function(Store, UItmpl){
    //模板引擎 dot => underscore, doT拥有此功能且性能高
    _.templateSettings = {
        evaluate    : /\{\{(.+?)\}\}/g,
        interpolate : /\{\{=(.+?)\}\}/g,
        escape      : /\{\{\-(.+?)\}\}/g
    };

    //重、写_.underscore方式，去支持include语法
    var template = function (str, data) {
        // match "<% include template-id %>"
        return _.template(
            str.replace(
                // /<%\s*include\s*(.*?)\s*%>/g,
                /\{\{\s*include\s*(.*?)\s*\}\}/g,
                function(match, templateId) {
                    var el = document.getElementById(templateId);
                    return el ? el.innerHTML : '';
                }
            ),
            data
        );
    };

    //根据tmplID获取模板;
    var parseTmpl = function(tmplID){
        var tmpls = $(UItmpl()).find("script"), iTmplID, iTmplStr, tmpl;
        tmpls.prevObject.each(function(i, item){
            iTmplID = item.id; iTmplStr = $(item).html();
            if(!!iTmplID && tmplID === iTmplID){
                tmpl = iTmplStr;
            }
        });
        return tmpl;
    };

    /**
     * View对象
     * @namespace
     * @constructs View
     * @return {Object} View
     * @example
     */
    var View = Class.extend({
        init:function(opts){
            this.wrapper = $(opts.wrapper);
            this.tmplname   = opts.tmplname  || '';  //模板名称, view的话在route里面配置，partial的话
            this.tmpl = opts.tmpl || '';             //模板html,有模板名称则从通过名称取到tmpl;
            this.data   = opts.data || {};
            this.replace = opts.replace || false;    //是否替换原标签
            this.events = opts.events || {};         // 对象上的events对象仅适用于此对象的wrapper元素内的事件绑定
            this.construct(opts);
        },
        //new View()时即执行的对象
        construct:function(opts){
            //console.log('this is', this, '[VIEW CONSTRUCT RUN WHEN EXTEND VIEW‘S OBJECT HASN’T CONSTRUCT]');
            if(this.events){
                this._parseEvent(opts.ctrl || this);
            }
        },

        //根据STORE与AJAX条件渲染视图,供View.extend的Page UI内部调用, 有wrapper时直接插入到页面，否则返回HTMLFragment,但是能返回的前提是，view是同步的
        render: function(){
            var frag = this.getHTMLFragment();
            if(this.wrapper){
                this.replace ? this.wrapper.replaceWith(frag) : this.wrapper.html(frag);
            }
            this.show();
            return this.wrapper.length ? this : frag;
        },
        //供继承对应重写
        show: function (){
            //this.wrapper.removeClass('hide');
        },

        //更新视图
        update: function(data){
            if(data){
                this.data = $.extend({}, this.data, data);
            }
            this.render();
        },
        //销毁视图
        destory: function(){
            this.wrapper.empty();
        },
        //获取带模板数据的virtual dom, 获取模板 partial or view ,默认partial
        getHTMLFragment: function(viewOrPartial){
            this.getHTMLTmpl(viewOrPartial);
            if(!this.tmpl) return;
            return this.data ? template(this.tmpl)(this) : template(this.tmpl);
        },

        //获取模板 partial or view ,默认partial，underscore template;
        getHTMLTmpl: function(viewOrPartial){
            var tmpl = (viewOrPartial === 'view') ? this.tmpl : parseTmpl(this.tmplname);
            this.tmpl = tmpl;
            return tmpl;
        },

        //给组件或页面绑定事件，采用了事件代理的方式
        onview: function(eventType, selector, listener){
            this.wrapper.on(eventType, selector, listener);
            return this;
        },
        offview: function(eventType, selector, listener){
            this.wrapper.off(eventType, selector, listener);
            return this;
        },
        //当没有wrapper时，render返回fragmentHTML,没有绑定事件，当fragmentHTML插入document后，可以调用此方法绑定固有事件
        //refreshEvent: function(){
        //    //this.wrapper =  //@todo如何找到 fragmentHTML 被插入的多个位置并重新绑定事件
        //    //this._parseEvent(this);
        //},
        /**
         * @param {object} env env为事件绑定时的listener所在的执行环境,为ctrl或View, UI-widget
         * events: {
         *   'click,touch selector1,selector2': 'function',
         *   'touch .selecor': 'function2'
         * }
         * function有二个参数 (e, target),其this指向所在的环境即env
         **/
        _parseEvent: function(env){
            var that = this;
            if(!this.events) return;
            this.offview();
            var events = this.events;
            for(var eve in events){
                (function(eve){
                    var eventSrc = getEventSrc(eve),
                        eventListener = events[eve];

                    that.onview(eventSrc.event, eventSrc.selector, function (e){
                        if(typeof eventListener === 'function'){
                            eventListener(e, this, env);   //events对象值为函数直接量时，参列为(e, target, that)第三个参数为所在的执行环境env,即this
                            return false;
                        }
                        env[eventListener](e, this);    //events对象值为字符串时, 参列为(e, target){ //内部this指向执行环境 }
                        return false;
                    });
                })(eve);
            }
            //如此的话， events触发的listener的this指向 发生动作的元素， e，对原生event对象， 第二个参数this为发生的对象，
            // eventListener里的this指向that,

            function getEventSrc(eve){
                var ret = /(\w+)+\s+(.+)/.exec(eve);
                return {
                    event: ret[1],  //event type 1
                    selector: ret[2],  //event selector all
                };
            }
        }
    });

    return View;
});
