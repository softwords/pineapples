/*
    Add ap.ication API to api module
*/

(function () {
    var fac = function (restAngular, errorService) {

        var svc = restAngular.all('teachers');

        return {
            filterPaged: function (fltr) {
                return svc.customPOST(fltr, 'collection/filter').catch(errorService.catch);
            },


        }
    };
    angular
        .module('pineapplesAPI')
        .factory('teachersAPI', ['Restangular', 'ErrorService', fac]);
})();
