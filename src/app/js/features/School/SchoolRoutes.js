// School Routes
(function () {

    var routes = function ($stateProvider) {
        var featurename = 'Schools';        
        var filtername = 'SchoolFilter';
        var templatepath = "school";
        var url = "schools";

        var mapview = 'SchoolMapView';

        swjs.routeHelper
            .addFeatureState($stateProvider, featurename, filtername, templatepath, url)
            .addListState($stateProvider, featurename)
            .addChartState($stateProvider, featurename)
            .addTableState($stateProvider, featurename)
            .addMapState($stateProvider, featurename, mapview)

        $stateProvider.state("site.schools.list.item", {
            url: "/item",
            params: { id: null, columnField: null, rowData: {} },
            views: {
                "actionpane@site.schools.list": {
                    templateUrl: "school/item",
                    controller: 'SchoolController',
                    controllerAs: 'vm'
                }

            },
            resolve: {
                data: ['schoolsAPI', '$stateParams', function (api, $stateParams) {
                    return api.read($stateParams.id);
                }]
            }
        });

        $stateProvider.state("site.schools.list.latlng", {
            url: "/latlng",
            params: { id: null, columnField: null, rowData: {} },
            views: {
                "actionpane@site.schools.list": {
                    templateUrl: "school/latlng",
                    controller: 'SchoolLatLng',
                    controllerAs: 'vm'
                }

            },
            resolve: {
                data: ['$stateParams', function(params) { return params.rowData;}]
                
            }
        });
    }

    angular
        .module('pineapples')
        .config(['$stateProvider', routes])

})();