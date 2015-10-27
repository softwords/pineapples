
(function () {
    angular.module('pineapplesAPI', ['restangular']);
}());


(function () {
    "use strict";
    // main module declaration
    var app = angular.module('pineapples',
        ['pineapplesAPI',
        'ui.bootstrap',
        //'scrollable-table',
        //theme is segmented into many modules, reference them all for now,
        ///'easypiechart',
        ///'toggle-switch',
        //'ui.bootstrap',
        ///'ui.tree',
        ///'ui.select2',
        ///'ngGrid',
        ///'xeditable',
        ///'flow',

        'theme.services',
        'theme.directives',
        // theme.main-controller eliminates themeApp - allowing scholar to be the unique app
        'theme.main-controller',
        'theme.navigation-controller',
        'theme.ui-progressbars',
       //// 'theme.notifications-controller',
       //// 'theme.messages-controller',
       //// 'theme.colorpicker-controller',
       //// 'theme.layout-horizontal',
       //// 'theme.layout-boxed',
       //// 'theme.vector_maps',
       //// 'theme.google_maps',
       //// 'theme.calendars',
       //// 'theme.gallery',
       //// 'theme.tasks',
       //// 'theme.ui-tables-basic',
       //// 'theme.ui-panels',
       //// 'theme.ui-ratings',
       //// 'theme.ui-modals',
       //// 'theme.ui-tiles',
       //// 'theme.ui-alerts',
       //// 'theme.ui-sliders',

       //// 'theme.ui-paginations',
       //// 'theme.ui-carousel',
       //// 'theme.ui-tabs',
       //// 'theme.ui-nestable',
       //// 'theme.form-components',
       //// 'theme.form-directives',
       //// 'theme.form-validation',
       //// 'theme.form-inline',
       //// 'theme.form-image-crop',
       //// 'theme.form-uploads',
       //// 'theme.tables-ng-grid',
       //// 'theme.tables-editable',
       //// 'theme.charts-flot',
       ////'theme.charts-canvas',
       //// 'theme.charts-svg',
       'theme.charts-inline',           // adds the sparklines directive for inline charts
       //// 'theme.pages-controllers',
       //// 'theme.dashboard',
       //// 'theme.templates',
       //// 'theme.template-overrides',


        ///'ngSanitize',            // requires angular sanitize - use for text editing of html
        'ui.grid',
        'ui.grid.pagination',       // breaking change in ui.grid from pagigng to pagination
        'ui.grid.pinning',
        'ui.grid.autoResize',
        // support for editable grids
        'ui.grid.cellNav',
        'ui.grid.edit',
        'ui.grid.rowEdit',
        'ui.router',
        //'ngAnimate',
        'ng-token-auth',
        'ngMap',
        'angular-dimple',
        'angularDc',
        'nvd3ChartDirectives',
        'sw.common'
        ]);


})();

///
/// Run - set up constants as properties of rootScope
///
(function () {

    var consts = function ($rootScope) {
        $rootScope.appName = 'Pineapples';

    }

    angular
        .module('pineapples')
        .run(['$rootScope', consts])


})();
