/*
 * Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
(function(){
    var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
    this.Class = function(){};
    Class.extend = function(prop) {
        var _super = this.prototype;
        initializing = true;
        var prototype = new this();
        initializing = false;
        for (var name in prop) {
            prototype[name] = typeof prop[name] == "function" &&
            typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                (function(name, fn){
                    return function() {
                        var tmp = this._super;
                        this._super = _super[name];
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;
                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }
        function Class() {
            if ( !initializing && this.init )
                this.init.apply(this, arguments);
        }
        Class.prototype = prototype;
        Class.prototype.constructor = Class;
        Class.extend = arguments.callee;
        return Class;
    };
})();

var gomPath = $('#gom')[0].src.match(/(.+)gom\.js/)[1];
console.log(gomPath, 'gomPath');
require.config({
    paths:{
        Gom:    gomPath + 'gom',
        App:    gomPath + 'app',
        UI :    gomPath + 'ui/ui',
        Button: gomPath + 'ui/ui.button',
        Header: gomPath + 'ui/ui.header',
        List:   gomPath + 'ui/ui.list',
        Modal:  gomPath + 'ui/ui.modal',
        Sides:  gomPath + 'ui/ui.sides',
        Scroll: gomPath + 'ui/ui.scroll',
        Slide:  gomPath + 'ui/ui.slide',
        Select: gomPath + 'ui/ui.select',
        View:   gomPath + 'core/view',
        Page:   gomPath + 'core/page',
        Service:gomPath + 'core/service',
        Store:  gomPath + 'utils/store',
        Url:    gomPath + 'utils/url',
        Fx:     gomPath + 'utils/fx',
        Swipe:  gomPath + 'utils/swipe',
        UITmpl: gomPath + 'ui/ui.tmpl'
    }
});
define('Gom', ['Service', 'Page', 'View', 'UI', 'App'], function(Service, Page, View, UI, App){
    /**
     * Gom对象
     * @constructs Gom
     * @param {object} config
     * @return {Object} Gom
     * @example
     * new Gom(config, route); 传入配置文件与路由文件
     */
    //var expires = 1000*60*5; //5min 过期时间，后面将从config.js配置里获取;
    var Gom ={
        version: '1.0.0',
        isWebApp: /http(s)?:\/\//.test(location.protocol),
    };

    var Module = {
        Service:Service,
        Page:   Page,
        View:   View,
        UI:     UI,
        App:    App
    };
    console.log(Module, 'Module');
    return Module;
});
