

;(function () {
    /* 
    --------------------------------------------------------------------
    Map Params Controller
    
    manages the centre, zoom level etc working with the renderOptions object
    --------------------------------------------------------------------
    */
    var mapParamsController = function ($scope, $rootScope, filter) {
        var self = this;

        this.theFilter = filter;

        this.Ready = false;

        this.renderOptions = null;
        this.boxOptions = [];

        var _selectedBox;
        Object.defineProperty(this, 'selectedBox', {
            get: function () { return _selectedBox; },
            set: function (newValue) {
                if (!(_selectedBox == newValue)) {
                    _selectedBox = newValue;
                    $rootScope.$broadcast("MapChangeBox", { entity: self.theFilter.entity, box: _selectedBox });
                };
                // this.awardTypeTots = this.grpAwardType.all();
            }
        });

        var _cluster = true;
        Object.defineProperty(this, 'cluster', {
            get: function () { return _cluster; },
            set: function (newValue) {
                if (!(_cluster == newValue)) {
                    _cluster = newValue;
                    $rootScope.$broadcast("MapChangeCluster", { entity: self.theFilter.entity, cluster: _cluster });
                };
                // this.awardTypeTots = this.grpAwardType.all();
            }
        });

        $scope.$on('SearchComplete', function (event, resultpack) {
            if (resultpack.entity = self.theFilter.entity + '.geo') {
                // resultset is an array of arrays - it was serialised from a Tables collection
                self.resultset = resultpack.resultset;

                // the first recordset is the data - we don;t need that?
                //self.pointData = resultpack.resultset[0];
                // we grab the marker bounding box
                var markerBoundingBox = resultpack.resultset[1][0];
                markerBoundingBox.couName = "(all markers)";


                // the final array is the bounding boxes of each country
                var o = [];
                o.push(markerBoundingBox);
                o = o.concat(resultpack.resultset[2]);

                // KLUDGE ALERT
                // make sure that name and code are defined,in couCode and couName used by desktop implementation
                o.forEach(function (d) {
                    d.name = d.name || d.couName;
                    d.code = d.code || d.coucode;
                })
                // END KLUDGE

                self.boxOptions = o;
                // if the currently selectedbounding box is still valid, preserve it
                var i = -1;
                if (self.selectedBox) {
                    var i = _.findIndex(self.boxOptions, { couName: self.selectedBox.couName });

                }
                if (i == -1)
                    i = 0;

                self.selectedBox = self.boxOptions[i];

            }

        });
        // using ng-map, this is how we get the goolge map object back to the controller
        $scope.$on('mapInitialized', function (event, map) {

            self.redraw();

        });

        this.makeLatLngBounds = function (nsew) {
            return this.makeLatLngBoundsNSEW(nsew.n, nsew.s, nsew.e, nsew.w);
        };

        this.makeLatLngBoundsNSEW = function (n, s, e, w) {
            var bnds = new google.maps.LatLngBounds();
            var SW = new google.maps.LatLng(s, w);
            var NE = new google.maps.LatLng(n, e);
            bnds.extend(SW);
            bnds.extend(NE);

            return bnds;
        };

        function applyBoundsCountry(couName) {
            var geocoder = new google.maps.Geocoder();
            var cName = zoomSelector.value;

            geocoder.geocode({ 'address': couName }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {

                    map.fitBounds(results[0].geometry.viewport);
                }
            });
        }

    };
    angular
         .module('sw.common')
         // the injection name 'theFilter' comes from the resolve on the ui-router state from which this controller is invoked
         .controller('MapParamsController', ['$scope', '$rootScope', 'theFilter', mapParamsController]);


})();

