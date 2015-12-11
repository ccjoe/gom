({
    baseUrl: './src',
    dir: './build',
    paths: {
        App:   'app',
        UI :   'ui/ui',
        Button:'ui/ui.button',
        Header:'ui/ui.header',
        List:  'ui/ui.list',
        Modal: 'ui/ui.modal',
        Sides: 'ui/ui.sides',
        Scroll:'ui/ui.scroll',
        Slide: 'ui/ui.slide',
        Select:'ui/ui.select',
        View:  'core/view',
        Page:  'core/page',
        Service:'core/service',
        Store: 'utils/store',
        Url:   'utils/url',
        Fx:    'utils/fx',
        Swipe: 'utils/swipe',
        UITmpl:'ui/ui.tmpl'
    },
    modules: [
        {
            name: 'Gom'
        }
    ],
    fileExclusionRegExp: /^(r|r-config)\.js|build|styles|3rd|ui\.tmpl\.html|readme.md$/,
    optimizeCss: 'standard',
    removeCombined: true
})
