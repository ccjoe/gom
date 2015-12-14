define(['View', 'Modal', 'Scroll', 'List'], function(View, Modal, Scroll, List) {

    /**
     * 多级联动或是仅多级选择组件
     * @class Gom.UI.Select
     * @alias Select
     * @extends {Gom.View}
     * @param {object} opts 参列
     * opts.wrapper {selecot} 当非model弹出时需要此属性，组件将插入到此wrapper
     * opts.data包含以下属性：
            title {string}  title
            level {number} 1 级数
            modal {boolean} 底部弹出选择
            cascade {boolean} true/false 是否级联 （级联表示每级之间有显示联系，无级联如时间选择， 有级联如日期选择）
            className 自定义的class
            yardNo {number} 准绳处于第几行,默认第三行(则可见总共五行)
            list = {'1': [], '2': []};
            onYes(select val);
            onNo();
     * @example 实例一个时间选择器
     * new Select({
            wrapper:
            title: '时间选择器',
            modal: true,    //显示
            cascade: false,
            level: 3,
            data: {'1':['上午','下午'],'2': _.range(1,13), '3': _.range(1,61)},
            onYes: function(val){
                console.log('选择的值为：' + val);
            }
        })
     **/
    var defaults = {
        title: '请选择',
        yardNo: 3,
        modal: true,
    };
    var Select = View.extend({
        init: function(opts){
            var data = opts.data = _.extend({}, defaults, opts.data);
            data.modal = (data.modal === void 0) ? true : data.modal;
            data.className = data.className || '';
            $.extend(this, opts);
            this.tmpl = this.makeScrollCtn();
            this._super(opts);
        },
        show: function(){
            var that = this; data = this.data;
            console.log(this.modal, 'thismodal');
            if(data.modal){
                Modal.bottom({title: data.title, content: this.makeScrollCtn(),
                    onYes: function(){
                        var val = that.getSelect();
                        data.onYes ? data.onYes(val) : null;
                    },
                    onNo: function(){
                        data.onNo ? data.onNo() : null;
                    }});
            }else{
                if(!this.wrapper){
                    console.error('当select没有指向为modal显示时，需要指定wrapper属性作为组件根元素');
                    return;
                }
                $(this.wrapper).addClass('gom-ui-select').html(this.makeScrollCtn());
            }
            this.setScroll();
            this.initSelect();
        },
        getScrollRoot: function(){
            return this.data.className ? $('.'+this.data.className) : $('.ui-scroll-select');
        },
        initSelect: function(){
            var $wrapper = this.getScrollRoot();
            for(var l=1; l<=this.data.level; l++) {
                $wrapper.find('.ss-cell-'+l).find('li.table-view-cell').eq(0).addClass('active');
            }
        },
        //生成scroll-select所有的 htmlFragment;
        makeScrollCtn: function(){
            var level = this.data.level, scrollCtn='', levelDom = '';
            var initPadding = (this.data.yardNo-1)*33;
            for(var l=1; l<=level; l++){
                levelDom = this.setListCont(l);
                scrollCtn += '<div class="ui-scroll-select-item ui-scroll-select-' +l+'"><div style="padding: '+ initPadding +'px 0;" class="ss-cell ss-cell-'+ l +'">'+levelDom+'</div></div>';
            }
            var selectYard = '<div class="ss-cell-yard" style="top: '+ initPadding +'px"></div>';
            return selectYard + '<div class="ui-scroll-select ' + this.data.className + '">'+scrollCtn+'</div>';
        },

        //根据level生成列表 htmlFragment
        setListCont: function(level){
            var levelData = this.data.list[level], levelDataExt = [];
            for(var i=0; i<levelData.length; i++){
                levelDataExt[i] = {};
                levelDataExt[i].title = levelData[i];
            }
            //console.log(levelDataExt, 'levelDataExt');
            var selectItem = {
                media: false,
                card: false,
                list: levelDataExt
            };

            return new List({
                data: selectItem
                //wrapper: '.ss-cell-'+level  //无wrapper时返回HTMLfragment
            }).render();
        },

        setScroll: function(){
            for(var l=1; l<=this.data.level; l++){
                new Scroll({
                    step: 33,
                    speed: 0.5,
                    wrapper    : '.ui-scroll-select-'+l,    //滚动对象所在的容器
                    className  : '.ss-cell-'+l,      //滚动对象的className
                    endScroll: function(point){
                        console.log(point, 'point');
                        var step = this.getSteps();
                        this.$scroll.find('li.table-view-cell').removeClass('active').eq(step).addClass('active');
                    }
                });
            }
        },
        /**
         * 获取选择后的值;
         * @method Gom.UI.Select#getSelect
         * @return 选择后的值
         */
        getSelect: function(){
            var $domRoot = this.getScrollRoot(), val, valArr = [];
            for(var l=1; l<=this.data.level; l++) {
                val = $.trim($domRoot.find('.ss-cell-'+l).find('li.table-view-cell.active').text());
                valArr.push(val);
            }
            return valArr;
        }

    });
    return Select;
});
