/* this object function only as a broker to reroute events

*/
/*
app.controller('SearchViewController', ['$scope', function ($scope) {
    // when we get the event from the FilterController, broadcast it to children ie siblings of the searcher
    $scope.$on('FindNow_', function (event, filter) {
        $scope.$broadcast('FindNow', filter);
    });

    // when a descendent gets new data, let everybody know
    $scope.$on('SearchComplete_', function (event, payload) {
        $scope.$broadcast('SearchComplete', payload);
    });
    // when a descendent gets new data, let everybody know
    $scope.$on('InvokeSearch_', function (event) {
        $scope.$broadcast('InvokeSearch');
    });
}]);
/*
    Filter Controller - manages the specification of filter parameters, and fires a search event
    Note that this can be a generic object, becuase the Filter is constructed from the bindings in the view


app.controller('SearcherController', ['$scope', '$state', 'initialFilter', function ($scope, $state, initialFilter) {

    var self = this;

    this.IsSorting = false;

    this.RaiseFindNow = function () {
        self.theFilter.PageNo = 1;
        $scope.$emit('FindNow_', self.theFilter);
    };

    $scope.$on("InvokeSearch", function () {
        self.RaiseFindNow();
    });

    this.Reset = function () {
        this.theFilter= initialFilter;
        this.resultset = null;
        this.summary = null;
    };



    $scope.$watch(function () {
        return this.theFilter.PageNo;
    }.bind(this), function (newVal, oldVal) { if (newVal !== oldVal) this.Search(); }.bind(this));

    // initialise everything
    this.Reset();



}]);
*/