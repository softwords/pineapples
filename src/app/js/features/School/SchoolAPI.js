/*
    Add ap.ication API to api module
*/

(function () {
    var fac = function (restAngular, errorService) {

        var svc = restAngular.all('schools');

        return {
            filterPaged: function (fltr) {
                return svc.customPOST(fltr, 'collection/filter').catch(errorService.catch);
            },
            table: function (fltr) {
                return svc.customPOST(fltr, 'collection/table').catch(errorService.catch);
            },
            geo: function (fltr) {
                return svc.customPOST(fltr, 'collection/geo').catch(errorService.catch);
            },

            read: function (id) {
                return svc.get(id).catch(errorService.catch);
            },

            // function to update the school Lat and Lng
            updateLatLng: function (pkg) {
                return svc.customPOST(pkg, 'item/updateLatLng').catch(errorService.catch);
            }

        }
    };
    angular
        .module('pineapplesAPI')
        .factory('schoolsAPI', ['Restangular', 'ErrorService', fac]);
})();
