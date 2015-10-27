// School Routes
(function () {

    var routes = function ($stateProvider)
    {
        var featurename = 'Workforce'

        swjs.routeHelper
            .addFeatureState($stateProvider,featurename)
            .addListState($stateProvider, featurename)
            //.addChartState(featurename)
           // .addTableState(featurename)
           // .addMapState(featurename)
    }

    angular
        .module('pineapples')
        .config(['$stateProvider',routes])

})();