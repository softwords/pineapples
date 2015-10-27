/*
    Add ap.ication API to scholarAPI module
*/

(function () {
    var fac = function (restAngular, errorService) {

        var svc = restAngular.all('SchoolScatter');

        return {
            filterPaged: function (scatterargs) {
                return svc.customPOST(scatterargs, 'collection/getScatter').catch(errorService.catch);
            },


        }
    };
    angular
        .module('pineapplesAPI')
        .factory('schoolScatterAPI', ['Restangular', 'ErrorService', fac]);
})();
