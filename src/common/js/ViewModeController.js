(function () {

    var viewModeController = function ($scope, $state, filter) {
        var self = this;

        this.theFilter = filter;

        var allowedViews;
        var defaultView;


        if ($state.current.data && $state.current.data.allowedViews) {
            var allowedViews = $state.current.data.allowedViews;
            self.SupportedViewModes = [];
            allowedViews.forEach(function (v) {
                if (_.find(filter.ViewModes, { key: v })) {
                    self.SupportedViewModes.push(v);
                }
            })
           
        }
        else {
            this.SupportedViewModes = _.pluck(filter.ViewModes, 'key');
        }
        // this.defaultColumnSet = $stateParams.defaultColumnSet || filter.ViewModes.defaults.columnSet || 1;

        // set up the initial state

        
        if ($state.current.data && $state.current.data.defaultView) {
            self.theFilter.ViewMode = $state.current.data.defaultView;
        }
        else {
            // if the current view mode is supported, keep it, otherwise use the first in the list
            if (self.theFilter.ViewMode && _.find(filter.ViewModes, { key: self.theFilter.ViewMode })) {
                // it's set and it's valied - do nothing
            }
            else { 
                self.theFilter.ViewMode = this.SupportedViewModes[0];
            }
        }
    };
    angular
        .module('sw.common')
        // theFilter will be injected by ui-router resolve 
        .controller('ViewModeController', ['$scope', '$state', 'theFilter', viewModeController]);
})();