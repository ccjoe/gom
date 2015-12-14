//引入插件时没有参数，因为插件在框架里全局运行， 这就要求框架引入依赖的zepto需在框架之前
define(['Swipe', 'Fx'], function() {
    //水平或垂直滚动的面板，just it;
    var vendor = (/webkit/i).test(navigator.appVersion) ? 'webkit' :
        (/firefox/i).test(navigator.userAgent) ? 'Moz' :
            'opera' in window ? 'O' : '';
    var has3d = 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix();
    /**
     * @class Gom.UI.Scroll
     * @alias Scroll
     * @param {object} opts 参列
     * opts.wrapper     require 滚动对象所在的容器
     * opts.className   require className 滚动对象的className
     * opts.step        options 步长 默认0 不计步长，滚动的结果一定是以此为单位, 滚屏网站时可以一屏一步长,
     *                  非滚动选择组件(time, district..)一般不用此属性,否则滚动以步长计不会具体到点
     * opts.outer       options 允许出界的范围
     * opts.outerFront  options 允许出界位置上面显示的html或文字
     * opts.speed 1     0与1之间  速度控制，默认1，在time选择器时设置小更容易选择，在页面滚动设置为1较好。
     * opts.outerEnd    允许出界位置下面显示的html或文字
     * opts.direction   options vertical/horizontal 默认为垂直 水平与垂直
     * opts.onScroll    options 每次滚动时回调 回调里的this指向本实例
     * opts.endScroll   options 每次滚动停回调 回调里的this指向本实例
     * opts.onTop       options 滚动到上时 回调里的this指向本实例
     * opts.onBottom    options 滚动到下时 回调里的this指向本实例
     //* opts.scrollBar options 是否显示滚动条
     * @example 实例
     * new Scroll({
             wrapper    : '.scroll-example2',    //滚动对象所在的容器
             className  : '.scroll-content',      //滚动对象的className
             direction  : 'vertical', //'vertical',             //水平与垂直
             step       : 0, // 不设置步长
             outer:       允许出界的范围
             outerFront : '允许出界位置上面显示的html或文字',
             outerEnd   : '允许出界位置下面显示的html或文字',
             onScroll: function(point){ },    //每次滚动时回调
             endScroll: function(point){ console.log('单次滚动结束'); }, //   每次滚动停回调
             onTop: function(){ console.log('滚动到最上面，滚动停止时触发')},       //滚动到上时
             onBottom:  function(){ console.log('滚动到最下面，滚动停止时触发')}   // 滚动到下时
        });
     */
    var Scroll = Class.extend({
        init: function (opts) {
            opts.direction = opts.direction || 'vertical';
            var defalutsThis = {
                $wrapper : $(opts.wrapper),
                $scroll : $(opts.className),
                step    : opts.step || 0,
                speed   : opts.speed || 1,
                outer   : opts.outer ||150,
                outerFront: opts.outerFront,
                outerEnd:  opts.outerEnd,
                isX     : opts.direction !== 'vertical',
                onScroll  : opts.onScroll || function(){},
                endScroll : opts.endScroll || function(){},
                onTop : opts.onTop || function(){},
                onBottom : opts.onBottom || function(){}
            };

            $.extend(this, defalutsThis);
            this.construct();
        },
        construct: function(){
          this.bindScroll();
        },
        bindScroll: function(){
            var that = this, $wrapper = this.$wrapper, direct = this.isX?'horizontal':'vertical';
            console.log(direct, 'direct');
            if(this.outerFront){
                $wrapper.prepend('<div class="ui-scroll-front">'+this.outerFront+'</div>');
            }
            if(this.outerEnd){
             $wrapper.append('<div class="ui-scroll-end">'+this.outerEnd+'</div>');
            }
            $wrapper.addClass('ui-scroll ui-scroll-'+direct).swipe({
                //swipeY: 30,
                moveCallback: function(point){
                    that._setScrollTrans(point, true);
                },
                endCallback: function(point){
                    that._setScrollTrans(point);
                }
            })
        },
        //滑动区域尺寸，纵向滚动获取总高度，横向滚动获取总宽
        getScrollSize: function(){
            return !this.isX ? this.$scroll.height() : this.$scroll.width();
        },
        //容器高度
        getWrapperSize: function() {
            return !this.isX ? this.$wrapper.height() : this.$wrapper.width();
        },
        //滚动到 num, elem, top, bottom
        /**
         * 滚动到...
         * @method Gom.UI.Scroll#scrollTo
         * @param {object} where 可以为具体的数字，元素, top, bottom字符串
         */
        scrollTo: function(where){
            var toType = typeof  where, val;
            if(where === 'top'){
                val = 0;
            }else if(where === 'bottom'){
                val = this.getWrapperSize() - this.getScrollSize();
            }
            if(toType === 'number'){
                val = where;
            }
            console.log(val, 'scrollTo val');
            this._scrollFxTo(val);
            console.log(this.getSteps(), '滚动的步长为：');
        },
        /**
         * 设置了step时获取滚动了多少步长
         * @method Gom.UI.Scroll#getSteps
         * @return  {number} 步长数
         */
        getSteps: function(){
            return   this.$scroll.data('swipe-steps');
        },
        _scrollFxTo: function(val){
            //有步长值的话以步长计
            if(this.step){
                var vals = this._getTransStep(val);
                console.log(vals, '步长信息');
                val = vals.val;
                this.$scroll.data('swipe-steps', vals.stepNum);
            }

            this.$scroll.data('swipe-offset', val);
            this.$scroll.fx(this._scrollCount(val));  //, 'normal', 'easeOutQuint'
        },
        //滚动时回调（moving为true为事件中回调，false为事件结束时回调）
        _setScrollTrans: function(point, moveing){
            var distance = this.isX ? point.swipeX : point.swipeY;
            var transVal = this._getTransVal(distance, point.swipeTime, moveing);
            var transStr = this._scrollCount(transVal);
            if(moveing){
                this.$scroll.css(transStr);
                this.onScroll(point);
            }else{
                this._scrollFxTo(transVal);
                this.endScroll(point);
            }
        },
        //计算当前滚动到的并限制边界范围
        _getTransVal: function(distance, swipeTime, moveing){
            distance = moveing ? distance : distance * this._getRatio(swipeTime);
            var swipeOffset = this.$scroll.data('swipe-offset') || 0;
            if(swipeOffset){
                distance += swipeOffset;
            }
            //限制区域
            var maxTransDis = this.getScrollSize() - this.getWrapperSize();
            var maxOuter    = moveing ? this.outer : 0,
                minRange = 0 + maxOuter,
                maxRange = maxTransDis + maxOuter;
            console.log(this.getScrollSize(), this.getWrapperSize(), distance, minRange, maxTransDis, maxRange, '滑动内容大小, 容器大小, 滑动距离, 最小范围, 最大位移， 最大范围');
            var absDis = Math.abs(distance), pxDis = distance + 'px';
            //在顶端越界拉时
            if(0 < distance &&  distance <= minRange){
                $('.ui-scroll-front').show().css({height: pxDis,'line-height': pxDis});
            }
            //在底端越界拉时
            if(maxTransDis < absDis &&  absDis <= maxRange){
                pxDis = (absDis-maxTransDis)+'px';
                $('.ui-scroll-end').show().css({height: pxDis, 'line-height': pxDis});
            }

            if(distance > minRange){
                distance = minRange;
                if(!moveing){
                    this.onTop();
                    $('.ui-scroll-front').hide();
                };
            }

            if(distance < -maxRange){
                distance = -maxRange;
                if(!moveing){
                    this.onBottom();
                    $('.ui-scroll-end').hide();
                };
            }

            return distance;
        },

        //计算当前滚动到的并限制步长结果的值,返回步长数与与滚动步长的值
        _getTransStep: function(val){
            console.log(val, 'val');
            var step = this.step, stepNum = Math.round(val/step);
            return {
                stepNum: Math.abs(stepNum),
                val: step*stepNum
            };
        },

        //根据swipe时间计算滚动速度
        _getRatio: function(swipeTime){
            var ratio, speedval = this.speed*1000;
            if(swipeTime > speedval){
                ratio = 1;
            }else{
                ratio = speedval/swipeTime;
                ratio = ratio > 30 ? 30 : ratio;
            }
            console.log(swipeTime, ratio, 'swipeRatio');
            return ratio;
        },

        //根据值计算滚动translate对象
        _scrollCount: function(val){
            var isX =  this.isX;       //水平垂直
            var x = isX ? (val+'px') : '0',
                y = isX ? '0' : (val+'px');
            var props = {};
            props['-'+ vendor + '-transform'] = has3d ?
            "translate3d("+x+","+y+",0)" :
            "translate("+x+","+y+")";
            return props;
        }

    });
    return Scroll;
});
