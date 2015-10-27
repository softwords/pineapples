
/*----------------------------------------------------------------------------------------------------------
    Pivoter Filter  - manages the specification of filter parameters, and fires a search event
    pivoterfilter is non-standard in that it does not require viewdefaults
    --------------------------------------------------------------------------------------------------------
*/
(function () {
    // This code is generated from Scholar reading the Access form
  
    var filter = function ($rootScope, api, basefilter, Lookups) {
        var self = this;



    var tableparams = {};
    var defaultparams = {
        defaults: {
            DimensionColumns: 'WEB',
            SurveyYear: 2010,
            DataColumns: 'ENROL',
                

        },
        locked: {}
    };

    var fltr = basefilter.Create('pivoter', api, defaultparams, tableparams, viewdefaults);

    fltr.findNow = function() {
        var promise = basefilter.ApiPromise.call()
    }
    

    return fltr;
}



   

    angular
        .module("pineapples")
        .factory("SchoolFilter", ["$rootScope", "schoolsAPI", 'BaseFilter', 'Lookups', filter]);

})();

