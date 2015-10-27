/* 
--------------------------------------------------------------------
Application Map Controller

manages the display of a map of applications
--------------------------------------------------------------------
*/
(function () {
    var mapController = function ($scope, $rootScope, filter, helper) {
        var self = this;

        this.theFilter = filter;

        this.Ready = false;

        
        this.selectedBox =  {};
        this.spiderfy = helper.Spiderfy() || true;;
        this.cluster = helper.Cluster() || true;
        this.enableKeyDragZoom = helper.EnableKeyDragZoom || true;
        this.colorBy = '';     // defaults to gender





      

        this.map = null;
        this.isWaiting = false;


        this.currentMarkers = [];           // we need to track these

        // the FindNow button got pushed - we need to redraw the chart
        $scope.$on('FindNow', function (event, data) {
            if (data.filter.entity == self.theFilter.entity) {
                self.isWaiting = true;
                data.filter.requestGeo();
            }

        });

        $scope.$on('SearchComplete', function (event, resultpack) {
            if (resultpack.entity == self.theFilter.entity  && resultpack.method == 'geo') {
                // resultset is an array of arrays - it was serialised from a Tables collection
                self.resultset = resultpack.resultset;

                // the first recordset is the data - thgis is used to create the markers
                self.pointData = resultpack.resultset[0];

                // second recordset is the bounding box
                var markerBoundingBox = resultpack.resultset[1][0];
                markerBoundingBox.couName = "(all markers)";
                if (!self.selectedBox.couName) {
                    self.selectedBox = markerBoundingBox;
                    
                }
                self.Ready = true;      //? not needed?? 
                self.redraw();          // this is where all the markers are drawn
                self.isWaiting = false;
            };

        });
        $scope.$on('SearchError', function (event, resultpack) {
            if (resultpack.entity == self.theFilter.entity) {
                // no point waiting around - this train aint comin'
                self.isWaiting = false;
            }
        });
   
        $scope.$on("MapChangeBox", function(event, args) {

            if (self.theFilter.entity == args.entity)
            {
                if (self.selectedBox != args.box) {
                    self.selectedBox = args.box;
                    self.fitBox();
                };
            }
        });
        $scope.$on("MapChangeCluster", function (event, args) {

            if (self.theFilter.entity == args.entity) {
                if (self.cluster != args.cluster) {
                    self.cluster = args.cluster;
                    self.redraw();
                };
            }
        });

        // using ng-map, this is how we get the goolge map object back to the controller
        $scope.$on('mapInitialized', function (event, map) {
            self.map = map;
            
            if (self.enableKeyDragZoom) {
                map.enableKeyDragZoom( {
                    visualEnabled: true,
                    visualPosition: google.maps.ControlPosition.LEFT_TOP,
                    veilStyle: {
                        webkitUserSelect: "none"
                    }
                });
            }

            self.redraw();
        });



        this.fitBox = function (box) {
            if (!box)
                box = self.selectedBox;
            if (box && self.map) {
                if (box.lat !== undefined && box.lng !== undefined) {
                    // its a point to zoom to check this before checking box
                    var center = new google.maps.LatLng(box.lat, box.lng);
                    // using global variable:
                    self.map.panTo(center);
                    if (box.zoom) {
                        self.map.setZoom(box.zoom);
                    };
                };
                if (box.n) {
                    self.map.fitBounds(self.makeLatLngBounds(box));
                    return;
                }

            };

        };
        //// path: 'M 200 100 m0,300 v150 m -75,-75 h150 M 200 100 m 106 43  l106 -106 m -75 0 h 75 m0 75 v -85 M 200 100 a 150 150 0 1 0 0.1 0 Z ',
        //this.mars = {
        //    path: 'M 200 100 m 106 43  l106 -106 m -75 0 h 75 m0 75 v -85 M 200 100 a 150 150 0 1 0 0.1 0 Z ',
        
        //    //path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
        //    anchor: new google.maps.Point(200,250),

        //    fillColor: '#f88',
        //    fillOpacity: 0.9,
        //    scale: .05,
        //    strokeColor: 'black',
        //    strokeWeight: 2
        //};
       
        //this.venus = {
        //    path: 'M 200 100 m0,300 v150 m -75,-75 h150 M 200 100 a 150 150 0 1 0 0.1 0 Z ',
        //    //path: ' m47,59H28m9.5,10V46.2a18.3,18.3 0 1,1 .1,0',
        //    //path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
        //    anchor: new google.maps.Point(200, 250),

        //    fillColor: '#88f',
        //    fillOpacity: 0.9,
        //    scale: .05,
        //    strokeColor: 'black',
        //    strokeWeight: 2
        //};
    
        //this.circle = {
        //    path: 'M 200 100 a 150 150 0 1 0 0.1 0 Z ',
        //    //path: ' m47,59H28m9.5,10V46.2a18.3,18.3 0 1,1 .1,0',
        //    //path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
        //    anchor: new google.maps.Point(200, 250),

        //    fillColor: '#DDD',
        //    fillOpacity: 0.9,
        //    scale: .07,
        //    strokeColor: 'black',
        //    strokeWeight: 2
        //};

        //this.icons = {
        //    mars: {
        //        default: this.mars
        //    },
        //    venus: {
        //        default: this.venus
        //    },
        //    circle: {
        //        default: this.circle
        //    },
          


        //}

        this.colorSelectors =  {
            status: d3.scale.ordinal()
                        .domain('Unsucessful')
        };
        this.redraw = function () {
            if (self.map) {
                if (self.markerClusterer) {
                    self.markerClusterer.clearMarkers();
                }
                else {
                    self.currentMarkers.forEach(function (marker) {
                        marker.setMap(null);
                    });
                };
                self.currentMarkers = [];
                self.fitBox();
                // if clsutering, defer add marker to map when creating marker
                var maptarget = (self.cluster ? null : self.map);

                if (self.pointData) {
                    var markers = [];

                    self.pointData.forEach(function (row) {
                        //<marker ng-repeat="row in mapc.pointData" position="{{row.sLat}},{{row.sLng}}" title="{{row.sFullName}}"></marker>

                        // add the markers to the markers array - if there is no clustering, they are at the same time added to the map
                        var marker = helper.MakeMarker(row, maptarget);
                        markers.push(marker);
                        if (!self.spiderfy) {
                            // only set up the click events if spiderfy is not used
                            // otherwise, let the spiderfier handle the clicks
                            var f = helper.OnMarkerClick(row, marker, maptarget);
                            if (f) {
                                google.maps.event.addListener(marker, 'click', f);
                            }
                        }
                    });

             
                    // spiderfy, no cluster
                    if (self.spiderfy) {

                        if (self.spiderfier) {
                            self.spiderfier.clearMarkers();
                        }
                        else {
                            self.spiderfier = setSpiderfier(self.map);
                        }
                        // if not clustering, add these to the map straight away
                        markers.forEach(function (mark) {
                            self.spiderfier.addMarker(mark);
                        })
                        // add the click listener
                        self.spiderfier.addListener('click', helper.OnSpiderClick(self.spiderfier, self.map));
                    };
                    if (self.cluster) {
                        self.markerClusterer = setClusterer(self.map, markers);
                    }
                    else {
                        self.markerClusterer = null;
                    }

                    self.currentMarkers = markers;
                };
            };
        };





        function setClusterer(map, markers) {
            var zoom = 8;
            var mcOptions = { gridSize: 10, maxZoom: zoom, zoomOnClick: false };
            
            return new MarkerClusterer(map, markers, mcOptions);
        };

        function setSpiderfier(map) {

            var oms = new OverlappingMarkerSpiderfier(self.map,
                           {
                               markersWontMove: true,
                               markersWontHide: true,
                               keepSpiderfied: true
                           });
            oms.addListener('click', function (mark) {
                //iw.setContent(marker.desc);
                //iw.open(map, marker);
                //var data = markers[mark.idx];
                // document.title = "<sID>" + data.id + "</sID>";
            });
            oms.addListener('spiderfy', function (marks) {
                marks.forEach(function (mark) {
                    row = mark.row;
                    mark.setIcon(helper.RowIcon(row, true));
                    mark.title = row.sFullName;
                });
             
            });
            oms.addListener('unspiderfy', function (marks) {
                marks.forEach(function (mark) {
                    var row = mark.row;
                    mark.setIcon(helper.RowIcon(row, false));
                    mark.title = (row.coloc > 1 ? row.coloc + ' people here...' : row.sFullName);
                });


            });

            return oms;
        };

        this.makeLatLngBounds = function (nsew) {
            if (nsew.n == undefined) {

            }
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

        // finally, if this Filter has already been searched, tell it we want to search again

        this.applyBoundsCountry = function (couName) {
            var geocoder = new google.maps.Geocoder();
            var cName = zoomSelector.value;

            geocoder.geocode({ 'address': couName }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {

                    map.fitBounds(results[0].geometry.viewport);
                }
            });
        };

        if (this.theFilter.prepared) {
            this.theFilter.FindNow();
        };

    };
    
    //Object.defineProperty(mapController.prototype, 'spiderfy', {
    //    get: function () { return this._spiderfy; },
    //    set: function (newValue) {
    //        if (!(this._spiderfy == newValue)) {
    //            this._spiderfy = newValue;
    //            self.redraw();
    //        };

    //    },
    //    enumerable: true,
    //    configurable: true
    //});


    //Object.defineProperty(mapController.prototype, 'cluster', {
    //    get: function () {
    //        console.log('get cluster');
    //        return this._cluster;
    //    },
    //    set: function (newValue) {
    //        console.log('set cluster');
    //        if (!(this._cluster == newValue)) {
    //            this._cluster = newValue;
    //            self.redraw();
    //        };
    //        // this.awardTypeTots = this.grpAwardType.all();
    //    },
    //    enumerable: true,
    //    configurable: true
    //});
    angular
        .module('sw.common')
        .controller('MapController', ['$scope', '$rootScope', 'theFilter','mapView', mapController]);



})();