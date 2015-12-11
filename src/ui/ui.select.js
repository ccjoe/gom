define(['Modal', 'Scroll', 'List'], function(Modal, Scroll, List) {
    //为多级联动或是仅多级选择
    /**
     * @construct CascadeScroll
     * @param {object} opts
     * opts.title {string}  title
     * opts.level {number} 1 级数
     * opts.cascade {boolean} true/false 是否级联 （级联表示每级之间有显示联系，无级联如时间选择， 有级联如日期选择）
     * opts.className 自定义的class
     * opts.data = {'1': [], '2': []};
     * opts.onYes(select val);
     * opts.onNo();
     * @example
     * 实例一个时间选择器
     * new Select({
            title: '时间选择器',
            cascade: false,
            level: 3,
            data: {'1':['上午','下午'],'2': _.range(1,13), '3': _.range(1,61)},
            onYes: function(val){
                console.log('选择的值为：' + val);
            }
        })
     **/
    var Select = Class.extend({
        init: function(opts){
            this.className = opts.className || '';
            $.extend(this, opts);
            this.construct();
        },
        construct: function(){
            var that = this;
            Modal.bottom({title: this.title, content: this.makeScrollCtn(),
                onYes: function(){
                    var val = that.getSelect();
                    that.onYes ? that.onYes(val) : null;
                },
                onNo: function(){
                    that.onNo ? that.onNo() : null;
                }});

            this.setScroll();
            this.initSelect();
        },
        getScrollRoot: function(){
            return this.className ? $('.'+this.className) : $('.ui-scroll-select');
        },
        initSelect: function(){
            var $wrapper = this.getScrollRoot();
            for(var l=1; l<=this.level; l++) {
                $wrapper.find('.ss-cell-'+l).find('li.table-view-cell').eq(0).addClass('active');
            }
        },
        //生成scroll-select所有的 htmlFragment;
        makeScrollCtn: function(){
            var level = this.level, scrollCtn='', levelDom = '';
            for(var l=1; l<=level; l++){
                levelDom = this.setListCont(l);
                scrollCtn += '<div class="ui-scroll-select-item ui-scroll-select-' +l+'"><div class="ss-cell ss-cell-'+ l +'">'+levelDom+'</div></div>';
            }
            var selectYard = '<div class="ss-cell-yard"></div>';
            return selectYard + '<div class="ui-scroll-select ' + this.className + '">'+scrollCtn+'</div>';
        },
        //根据level生成列表 htmlFragment
        setListCont: function(level){
            var levelData = this.data[level], levelDataExt = [];
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
            for(var l=1; l<=this.level; l++){
                new Scroll({
                    step: 33,
                    speed: 0.5,
                    wrapper    : '.ui-scroll-select-'+l,    //滚动对象所在的容器
                    className  : '.ss-cell-'+l,      //滚动对象的className
                    endScroll: function(point){
                        var step = this.getSteps();
                        this.$scroll.find('li.table-view-cell').removeClass('active').eq(step).addClass('active');
                    }
                });
            }
        },
        /**
         * 获取选择后的值;
         * @method Select#getSelect
         * @return 选择后的值
         */
        getSelect: function(){
            var $domRoot = this.getScrollRoot(), val, valArr = [];
            for(var l=1; l<=this.level; l++) {
                val = $.trim($domRoot.find('.ss-cell-'+l).find('li.table-view-cell.active').text());
                valArr.push(val);
            }
            return valArr;
        }

    });
    return Select;
});
