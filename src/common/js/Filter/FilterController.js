// simple controller to provide access to a Filter object
// used by heaerbar items like searcher, chart params, table params

// adds special support for chart and tables - row, col and swap
// tableoptions is a string anming the member of lookups.cache to use for table and chart dropdowns
//



(function () {
    var filtercontroller = function (filter, lookups, tableoptions) {

        var self = this;
        /* Chart options */


        this.theFilter = filter;
        this.Lookups = lookups;         // allow searchers using this controller access to lookups to popuplate dropdowns
        // using ng-options - e.g. vm.Lookups.cache.psGroups

        // used by chart searcher
        if (tableoptions) {
            this.tableOptions = lookups.cache[tableoptions];
        }
        
        this.Swap = function () {
            var col = self.theFilter.tableparams.col;
            self.theFilter.tableparams.col = self.theFilter.tableparams.row;
            self.theFilter.tableparams.row = col;
            self.theFilter.FindNow();
        }

        Object.defineProperty(self, 'row', {
            get: function () { return self.theFilter.tableparams.row; },
            set: function (newValue) {
                if (!(self.theFilter.tableparams.row == newValue)) {
                    self.theFilter.tableparams.row = newValue;
                    self.theFilter.FindNow();
                };

            }
        });
        Object.defineProperty(self, 'col', {
            get: function () { return self.theFilter.tableparams.col; },
            set: function (newValue) {
                if (!(self.theFilter.tableparams.col == newValue)) {
                    self.theFilter.tableparams.col = newValue;
                    self.theFilter.FindNow();
                };

            }
        });


    };
    angular
        .module('sw.common')
        // the injection name 'theFilter' comes from the resolve on the ui-router state from which this controller is invoked
        .controller('FilterController', ['theFilter', 'Lookups', 'tableOptions', filtercontroller]);

})();
