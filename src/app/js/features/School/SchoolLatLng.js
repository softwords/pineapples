
(function () {

    //
    // dependencies:
    // school - an object containing the school data - this is passed as a row {}
    // api the school api
    var ctrlr = function ($scope, api, school) {

        var self = this;
        self.selectedSchool = school;
        self.enableKeyDragZoom = true;
    
        // event handler functions

        var addMarker = function (event) {
            // create the marker at the clicked position
            $scope.Lat = event.latLng.lat();
            $scope.Long = event.latLng.lng();


            self.marker = new google.maps.Marker({
                position: event.latLng,
                map: self.map,
                title: self.selectedSchool.schName,
                draggable: true
            });
            self.state = 'Ready';
            $scope.$apply();        // becuase this has been involded from the google map outside angular

        };

        var dropMarker = function (event) {

            $scope.Lat = event.latLng.lat();
            $scope.Long = event.latLng.lng();
            $scope.$apply();
        };


        // respond to a click on the map by moving the marker there
        var moveMarker = function (event) {

            $scope.Lat = event.latLng.lat();
            $scope.Long = event.latLng.lng();
            self.marker.setPosition(event.latLng);
            $scope.$apply();
        };

        $scope.$on('mapInitialized', function (event, map) {
            self.map = map;
            // execute

            if (self.enableKeyDragZoom) {
                map.enableKeyDragZoom({
                    visualEnabled: true,
                    visualPosition: google.maps.ControlPosition.LEFT_TOP,
                    veilStyle: {
                        webkitUserSelect: "none"
                    }
                });
            }

            
            if (self.selectedSchool) {
                self.moveMap();
            }

        });

        // entry point when school is changed
        this.moveMap = function () {
            self.state = '';        // indeterminate - force recalculate
            if (self.marker) {
                self.marker.setMap(null);
                self.marker = null;
            }
            // does the school have a lat long?
            // if so, go to it and zoom, if not, show an appropriate region
            if (self.selectedSchool.schLat && self.selectedSchool.schLong) {
                var posn = new google.maps.LatLng(self.selectedSchool.schLat, self.selectedSchool.schLong);
                // using global variable:

                $scope.Lat = null;
                $scope.Long = null;
                self.marker = new google.maps.Marker({
                    position: posn,
                    map: self.map,
                    title: self.selectedSchool.schName,
                    draggable: true
                });
                self.map.panTo(posn);
                self.map.setZoom(16);               // go in close if we have a point
                self.state = 'Ready';
            }
            else {
                var posn = new google.maps.LatLng(-8.312059183575627,158.50799560546875);
                self.map.panTo(posn);
                self.map.setZoom(6);               // whole of solomons
                self.state = 'Add';
            }
            
        }


        var _mapClickListener;
        var _markerClickListener;
        var _markerDropListener;



        var resetHandlers = function () {
            if (_mapClickListener) {
                google.maps.event.removeListener(_mapClickListener);
            }
            if (_markerDropListener) {
                google.maps.event.removeListener(_markerDropListener);
            }
            switch (self.state) {
                case 'Add':
                    // requires the click handler on the map surface
                    _mapClickListener = google.maps.event.addListener(self.map, "click", addMarker);
                    break;
                case 'Ready':
                    // add the handler for dragend
                    _markerDropListener = google.maps.event.addListener(self.marker, "dragend", dropMarker);
                    _mapClickListener = google.maps.event.addListener(self.map, "click", moveMarker);
            }
        };
        var _state;
        Object.defineProperty(self, 'state', {

            get: function () { return _state; },
            set: function (newValue) {
                if (!(_state == newValue)) {
                    _state = newValue;
                    // set up the handlers required for the state
                    resetHandlers();

                };
                // this.awardTypeTots = this.grpAwardType.all();
            }
        });


        this.saveLatLong = function () {
            var pkg = {
                schNo: self.selectedSchool.schNo,
                Lat: $scope.Lat,
                Lng: $scope.Long
            };
            api.updateLatLng(pkg).then(function () {
                self.selectedSchool.schLat = $scope.Lat;
                self.selectedSchool.schLong = $scope.Long;
            });
        };

      
    };


    angular
        .module("pineapples")
        .controller("SchoolLatLng", ['$scope', 'schoolsAPI', 'data', ctrlr])
})();