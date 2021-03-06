﻿/*
    Add ap.ication API to api module
*/

(function () {
    var fac = function (restAngular, errorService) {

        var svc = restAngular.all('workforce');

        return {
            filterPaged: function (fltr) {
                return svc.customPOST(fltr, 'collection/filter').catch(errorService.catch);
            },


        }
    };
    angular
        .module('pineapplesAPI')
        .factory('workforceAPI', ['Restangular', 'ErrorService', fac]);
})();
