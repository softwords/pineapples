/* ------------------------------------------
    lookupsAPI
    ----------------------------------------
*/
(function () {
    var api = function (restAngular) {
        //var restAngular = Restangular.withConfig(function(Configurer) {
        //     Configurer.setBaseUrl('/api/v2/messages');
        //  });

        var _wreqService = restAngular.all('lookups');

        return {
            core: function () {
                return _wreqService.customPOST({}, 'collection/core');
            }
        }
    };
    angular
        .module('sw.common')
        .factory('lookupsAPI', ['Restangular', api]);
})();