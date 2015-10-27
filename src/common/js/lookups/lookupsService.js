/* ------------------------------------------
    lookups Service
    ----------------------------------------
*/
(function () {
    var svc = function ($q,lookupsAPI) {
        
        var self = this;
        this.cache;
        this.init = function () {
            var d = $q.defer();
            if (self.cache) {
                d.resolve(self.cache);
            }
            else {
                lookupsAPI.core().then(
                    function (result) {
                        self.cache = result;
                        // add public and open in here
                        self.cache.InService = [{ C: 'Public' }, { C: 'Open' }];
                        d.resolve(self.cache);
                    },
                    function (error) {
                        d.reject(error);
                    }
                );
            };
            return d;
        };
        this.FindByID = function (codeset, id) {
            
            return _.find(this.cache[codeset], {ID: id})|| {};
        }
    };
    angular
        .module('sw.common')
        .service('Lookups', ['$q','lookupsAPI', svc]);
})();