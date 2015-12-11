define(['View','Fx'], function(View) {
    var data = {
        type: 'loading', //alert, confirm, topup, top, bottom,
        btns: {
            yes: '确定',
            no:  '取消'
        },
        title: '',
        content: '',   //content为str或html,如果为function则需要返回str或html
        class: '',
        mask: true
    };
    var noop = function(){};
    /**
     * 此方法一般用于自定义弹出层组件
     *  @construct Modal
     *  @param {opts} 传入的opts参数，会覆盖static默认参数
     *  opts对象可传入的有如下对象，如果opts为string时，则表示为opts.content
     *  {  type: '',  //在具体实例中已定义，扩展时可自定义名称
           btns: {
                yes: '确定',
                no:  '取消'
            },
            title: '',
            content: '',   //content为str或html,如果为function则需要返回str或html
            class: '',
            mask: true,
            onYes: function(){},
            onNo: function(){}
            }
     *  @return modal 弹出层实例
     *  @example
     */
    var Modal = View.extend({
        init: function (opts) {
            opts.data = $.extend({}, data, opts.data);
            $.extend(opts, this);   //将List实例混合到opts上， 去父对象上执行
            opts.tmplname = 'ui.modal';
            opts.wrapper = opts.wrapper || '#modal';
            this._super(opts);
            this.onYes = opts.data.onYes || noop;
            this.onNo = opts.data.onNo || noop;
            this.mask = opts.data.mask;
        },
        //显示视图
        show: function (){
            this.wrapper.fadeIn(100);
            this.reloc();
            this.toggleModal();

            if(this.isToast()){
                this.autoHide();
            }
            if(this.mask !== true){
                $('.modal-overlay').removeClass('modal-overlay-visible');
            }
        },

        getType: function(){
            return this.data.type;
        },
        isToast: function(){
            return this.getType().indexOf('toast')!==-1;
        },
        /**
         *@return {string} top|bottom, false时为非modal top|bottom
         */
        isTopBot: function(){
            var type =  this.getType();
            var is = (type ==='top' || type==='bottom');
            if(is){return type}
            return is;
        },
        getModal: function(){
            return this.wrapper.find(this.isToast() ? '.modal-toast' : '.modal-layout');
        },
        /**
         * 判断显示与隐藏及相应动画
         * @method Modal#toggleModal
         * @param {string} inOrOut in|显+out|隐
         * @param {function} callback
         **/
        toggleModal: function(inout){
            inout = inout || 'In';
            var pos = this.isTopBot();
            if(pos){
                this['slide'+inout+'Modal'](pos);
            }else{
                this['scale'+inout+'Modal'](); //居中
            }
        },

        scaleInModal: function(){
            this.getModal().css({
                opacity: 0.2, transform: 'scale(1.5)'
            }).fx({
                opacity: 1, scale: 1
            }, 300, 'easeOutCirc');
        },
        scaleOutModal: function(){
            var that = this;
            this.getModal().fx({
                opacity: 0, scale: 0.2
            }, 300, 'easeOutCirc', function(){
                that.wrapper.hide();
            });
        },
        /**
         *@param {string} pos top|bottom
         */
        slideInModal: function(pos){
            var fxprops = {opacity: 1};
                fxprops[pos] = 0;
            this.getModal().fx(fxprops, 300, 'easeOutCirc');
        },
        slideOutModal: function(pos){
            var that = this;
            var fxprops = {opacity: 0};
                fxprops[pos] = -this.getModal().height();
            this.getModal().fx(fxprops, 300, 'easeOutCirc', function(){
                that.wrapper.hide();
            });
        },
        //重置为动画前状态
        reloc: function(){
            var ml = this.getModal(),  h = ml.height(), pos = this.isTopBot();
            var props = {}; props[pos] = -h;
            ml.css('height', h).css(pos ? props : {'margin-top': -h/2}); //居上|下 //居中
        },
        close: function(){
            this.wrapper.hide();
        },
        autoHide: function(){
            var that = this;
            var time = setTimeout(function(){
                that.toggleModal('Out');
                clearTimeout(time);
            }, 3000);
        },
        events: {
            'click .modal-overlay': '_onNo',
            'click .modal-btn-yes': '_onYes',
            'click .modal-btn-no': '_onNo'
        },
        _onYes: function(){
            this.onYes();
            this.toggleModal('Out');
        },
        _onNo: function(){
            this.onNo();
            this.toggleModal('Out');
        }
    });

    var ModalExtend = {
        /**
         * 此方法一般用于自定义弹出层组件
         *  @method Modal.layout
         *  @param {object} static 默认参数
         *  @param {opts} 传入的opts参数，会覆盖static默认参数
         *  @param {string} type 弹出层对象的名称
         *  opts对象可传入的有如下对象，如果opts为string时，则表示为opts.content
         *  {  type: '',  //在具体实例中已定义，扩展时可自定义名称
               btns: {
                    yes: '确定',
                    no:  '取消'
                },
                title: '',
                content: '',   //content为str或html,如果为function则需要返回str或html
                class: '',
                mask: true
            }
         *  @return modal 弹出层实例
         *  @example
         */
        layout: function(static, opts, type){
            var optsObj = {};
            if(typeof opts === 'string'){
                optsObj.content = opts;
            }else{
                optsObj = opts;
            }

            return new Modal({data: $.extend({}, static, optsObj, {type: type})});
        },
        /**
         * 显示警告框
         *  @method Modal.alert
         *  @param {opts} 传入的opts参数，会覆盖static默认参数， 同Modal.layout的opts对象, 如果opts为string时，则表示为opts.content
         *  @return modal 弹出层实例
         */
        alert:function(opts){
            var alertStatic = {
                title: opts.title || '警告:',
                btns: {
                    yes: 'OK'
                }
            };
            return this.layout(alertStatic, opts, 'alert').render();
        },
        /**
         * 显示对话框
         *  @method Modal.confirm
         *  @param {opts} 传入的opts参数，会覆盖static默认参数， 同Modal.layout的opts对象, 如果opts为string时，则表示为opts.content
         *  @return modal 弹出层实例
         */
        confirm:function(opts){
            var confirmStatic = {
                title: opts.title || '请确认:',
                btns: {
                    yes: '确定', no: '取消'
                }
            };
            return  this.layout(confirmStatic, opts, 'confirm').render();
        },
        /**
         * 显示loading
         *  @method Modal.loading
         */
        loading:function(){
            return new Modal({
                data:{
                    type: 'loading',
                    btns: false,
                    title: false,
                    mask: false
                }
            }).render();
        },
        /**
         * 显示对话框
         *  @method Modal.center
         *  @param {opts} 传入的opts参数，会覆盖static默认参数， 同Modal.layout的opts对象, 如果opts为string时，则表示为opts.content
         *  @return modal 弹出层实例
         */
        center:function(opts){
            var confirmStatic = {
                title: opts.title || '',
                btns: false
            };
            return  this.layout(confirmStatic, opts, 'center').render();
        },
        /**
         * 显示 top layout
         *  @method Modal.top
         *  @param {opts} 传入的opts参数，会覆盖static默认参数， 同Modal.layout的opts对象, 如果opts为string时，则表示为opts.content
         *  @return modal 弹出层实例
         */
        top: function(opts){
            var bottomStatic = {
                title: opts.title || '',
                btns: false,
            };
            return this.layout(bottomStatic, opts, 'top').render();
        },
        /**
         * 显示 bottom layout
         *  @method Modal.bottom
         *  @param {opts} 传入的opts参数，会覆盖static默认参数， 同Modal.layout的opts对象, 如果opts为string时，则表示为opts.content
         *  @return modal 弹出层实例
         */
        bottom: function(opts){
            //比如下面的时间选择器， ACTIONSHEET等
            var bottomStatic = {
                title: opts.title || '',
                btns: {
                    no: '取消',
                    yes: '完成'
                },
            };
            return this.layout(bottomStatic, opts, 'bottom').render();
        },
        popover: function(opts){
            var tipsStatic = {
                type: 'tips',
                btn: false,
                content: [{},{},{}]
            };
            return this.layout(tipsStatic, opts).render();
        },
        /**
         * 显示不同类型的弹出提示
         * @param {string} content 显示的内容;
         * @param {string} toastType 显示类别，有 warn info error, 默认info;
         * @return toast弹出层实例
         */
        toast: function(content, toastType){
            toastType = toastType || 'info';
            return new Modal({
                wrapper: '#toast',
                data:{
                    type: 'toast-'+toastType,
                    content: content,
                    btns: false,
                    title: false
                }
            }).render();
        }
    };
    return $.extend({}, {modal: Modal}, ModalExtend);
});
