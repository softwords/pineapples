/*
    Add ap.ication API to api module
*/

(function () {
    var fac = function (restAngular) {

        var svc = restAngular.all('mande');

        return {
            vermdata: function (fltr) {
                return svc.withHttpConfig({cache: true}).customGET('collection/vermdata');
            },


        }
    };
    angular
        .module('pineapplesAPI')
        .factory('mandeAPI', ['Restangular', fac]);
})();
