/*
    Pivoter API
    designed for building crossfilters from pivot table queries
*/

(function () {
    var fac = function (restAngular, errorService) {

        var svc = restAngular.all('pivoter');

        return {
            enrolment: function (fltr) {
                return svc.customPOST(fltr, 'collection/enrolment').catch(errorService.catch);
            }



        }
    };
    angular
        .module('pineapplesAPI')
        .factory('schoolsAPI', ['Restangular', 'ErrorService', fac]);
})();
