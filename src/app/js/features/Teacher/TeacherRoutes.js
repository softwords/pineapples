// teacher Routes
(function () {

    var routes = function ($stateProvider) {
        var featurename = 'Teachers';
        var filtername = 'TeacherFilter';
        var templatepath = "teacher";
        var url = "teachers";

        swjs.routeHelper
            .addFeatureState($stateProvider, featurename, filtername, templatepath, url)
            .addListState($stateProvider, featurename)
            .addChartState($stateProvider, featurename)
            .addTableState($stateProvider, featurename)
            .addMapState($stateProvider, featurename)
    }

    angular
        .module('pineapples')
        .config(['$stateProvider', routes])

})();