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

    //toElem继承elem所有属性但排除组件定义属性, class会叠加，其它会替换，组件定义的相关属性不会继承
    var inheritAttrs = function(elem, toElem){
        var attributes = elem.prop("attributes"),
            $toElem = $(toElem);
        $.each(attributes, function() {
            if(this.name === 'class'){
                $toElem.attr(this.name, this.value + ' '+ $toElem.attr('class'));
            }else if(this.name !== 'data-opts' && this.name !== 'data-ui-widget'){
                $toElem.attr(this.name, this.value);
            }
        });
        return $toElem;
    };

    /**
     * View对象 - 抽象类，供所有UI组件和Page对象继承
     * @class Gom.View
     * @alias View
     * @param {object} opts 参列
     * @param {object} [opts.wrapper]  View类对应的视图根元素，即应放入的位置, 此属性被组件或Page继承后为组件或页面应插入的位置,不指定时返回View的htmlFragment
     * @param {object} [opts.tmplname]   View类对应的模板名称, page的话在route里面配置tmplname，各组件的话在组件内部重写为固定值去对应组件模板, 有tmpl时不需要指定
     * @param {object} [opts.tmpl]     View类对应的htmlFragment代码片断
     * @param {object} [opts.replace]  为true时会替换掉wrapper根元素，但会保留其上除data-ui-widget的其它属性
     * @param {object} opts.data     View类对应的数据, 在组件内实现，通过data的内部定义实现了组件的多态
     * @param {object} [opts.events]   View类对应的事件绑定 在UI组件或页面Ctrl里可以直接定义events对象，为组件或页面里需要的元素注册事件与监听
     * @desc 因为View对象为抽象类，供所有UI组件和Page对象继承，各属性继承后的意义见具体对象
     * events: {
     *   'click,touch selector1,selector2': 'listenerName1',
     *   'touch .selecor': 'listenerName2',
     *   'touch .selecor2': function(){}
     * }
     * 监听可以为二种类型，string指向的function或function直接量
     * 监听为string有二个参数 (e, target), e为事件对象， target为触发事件的元素，其中listener内this指向所在的环境即env
     * 监听为function直接量有三个参数 (e, target, that), that指向所在的环境即env对象
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
        construct:function(opts){
            if(this.events){
                this._parseEvent(opts.ctrl || this);
            }
        },
        /**
         * 渲染页面或组件或其它视图,一般组件需要手动调用此方式显示组件
         * @method Gom.View#render
         * @returns {View|string} 传入wrapper时返回View对象,显示组件在wrapper里，不传则返回View的htmlFragment(Html片断)
         */
        render: function(){
            var wrap = this.wrapper;
            var frag = this.getHTMLFragment(), $frag;
            if(wrap){
                if(this.replace){
                    $frag = inheritAttrs(wrap, frag);
                    wrap.replaceWith($frag);
                    this.wrapper = $frag;   //会this.wrapper指向替代后的位置
                }else{
                    wrap.html(frag)
                }

            }
            this.show();
            return wrap.length ? this : frag;
        },
        /**
         * View#render后的回调, 一般用于组件实例里供继承View时重写此方法，在render组件后UI业务处理
         * @method Gom.View#show
         */
        show: function (){
            //this.wrapper.removeClass('hide');
        },
        /**
         * 更新视图
         * @method Gom.View#update
         * @param {object} data  -传入数据对象或数据某一属性，更新相应数据到UI
         */
        update: function(data){
            if(data){
                this.data = $.extend({}, this.data, data);
            }
            this.render();
        },
        /**
         * 销毁视图
         * @method Gom.View#destory
         */
        destory: function(){
            this.wrapper.empty();
        },
        /**
         * 获取带模板数据的virtual dom
         * @method Gom.View#getHTMLFragment
         * @param {string} [viewOrPartial=partial] -其值为 'partial' or 'view'
         * @return {tmpl}
         */
        getHTMLFragment: function(viewOrPartial){
            this.getHTMLTmpl(viewOrPartial);
            if(!this.tmpl) return;
            return this.data ? template(this.tmpl)(this) : template(this.tmpl);
        },

        /**
         * 获取 partial模板(组件模板) or view模板(页面模板)
         * @method Gom.View#getHTMLTmpl
         * @param {string} [viewOrPartial=partial] -其值为 'partial' or 'view'
         * @returns {*|string|tmpl}
         */
        getHTMLTmpl: function(viewOrPartial){
            if(this.tmpl){
                return this.tmpl;
            }
            var tmpl = (viewOrPartial === 'view') ? this.tmpl : parseTmpl(this.tmplname);
            this.tmpl = tmpl;
            return tmpl;
        },
        /**
         * @callback eventCallback
         * @param {e} e eventObject
         */

        /**
         * 给组件或页面上selector指向的元素绑定事件代理，事件代理在组件根元素
         * @method Gom.View#onview
         * @param {Event} eventType
         * @param {selector} selector
         * @param {eventCallback} listener - 事件监听回调
         * @returns {View}
         */
        onview: function(eventType, selector, listener){
            this.wrapper.on(eventType, selector, listener);
            return this;
        },
        /**
         * 给组件或页面上selector指向的元素取消绑定事件代理
         * @method Gom.View#offview
         * @param {Event} eventType
         * @param {selector} selector
         * @param {eventCallback} listener - 事件监听回调
         * @returns {View}
         */
        offview: function(eventType, selector, listener){
            this.wrapper.off(eventType, selector, listener);
            return this;
        },
        /**
         * @method Gom.View#refreshEvent
         * @todo 当没有wrapper时，render返回fragmentHTML,没有绑定事件，当fragmentHTML插入document后，可以调用此方法绑定固有事件
         */
        refreshEvent: function(){
        //    //this.wrapper =  //@todo如何找到 fragmentHTML 被插入的多个位置并重新绑定事件
        //    //this._parseEvent(this);
        },
        /**
         * @private
         * @method Gom.View#_parseEvent
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
