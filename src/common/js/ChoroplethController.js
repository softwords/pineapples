/* 
--------------------------------------------------------------------
Choropleth Map Controller
-- creates a thematic map of shaded regions
-- built on angular-map
 the key ingredients of the chorpleth are
 -- a set of google.map.data.Features, which define the regions , both metadata and geometry
 -- a StyleFunction to define the style of each feature

 
 -- this stylefunction will react to some data value associated to the region,
 -- ie we have a  [ { name: 'n', value: v }] array to define those values
 - and a mapping v to a style object

 function(v) {
 return {.... styleobject };
 }



--------------------------------------------------------------------
*/
(function () {
    var ctrlr = function ($scope, geoJson) {

        var self = this;

        // the data array
        this.data;

        self.geoJson = geoJson;
        // this option defines minum values for color ranges
        self.colormap;
        // for loading the geojson
        self.idpropertyname;
        self.getDataId = getDataId;


        function getDataId(feature) {
            return feature.getProperty('couCode');
        }

        self.getValueFromId = function(id) {
            // default is to look up the data
            return 0;
        }
        self.getValue = function(feature) {
            var id = getDataId(feature);
            return self.getValueFromId(id);
        }

        //self.getColorFromColorMap = getColorFromColorMap;

        function getColorFromColorMap(v) {
            //lookup the value in the color map
            return 'blue';
        }

        
        $scope.styleFunction = function( feature) {
            var v = self.getValue(feature);
            if (self.getDataId(feature) == '') {
                return {
                    visible: false
                };
            };

            return {
                fillColor: getColorFromColorMap(v)
            };
        }
        this.Ready = false;

        this.renderOptions = null;           // the google map

        this.map = null;

        // the FindNow button got pushed - we need to redraw the chart
        $scope.$on('FindNow', function (event, data) {
            if (data.filter.entity == self.theFilter.entity) {
                data.filter.requestGeo();
            }

        });

        $scope.$on('SearchComplete', function (event, resultpack) {
            if (resultpack.entity == self.theFilter.entity + '.geo') {
                // resultset is an array of arrays - it was serialised from a Tables collection
                self.resultset = resultpack.resultset;

                // the first recordset is the data
                self.pointData = resultpack.resultset[0];

                // we also get passed the renderOptions which provides a means of communication
                // between the various views interacting with this map
                self.renderOptions = resultpack.renderOptions;
                $scope.$watch(function () { return self.renderOptions.selectedBox; },
                   function () { self.redraw(); });
                self.Ready = true;
            };

        });

        // using ng-map, this is how we get the goolge map object back to the controller
        $scope.$on('mapInitialized', function (event, map) {
            self.map = map;
        });



        this.redraw = function () {
            if (self.renderOptions && self.map) {
                if (self.renderOptions.selectedBox) {
                    self.map.fitBounds(self.makeLatLngBounds(self.renderOptions.selectedBox))
                };

            };
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

      
        this.applyBoundsCountry = function (couName) {
            var geocoder = new google.maps.Geocoder();
            var cName = zoomSelector.value;

            geocoder.geocode({ 'address': couName }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {

                    map.fitBounds(results[0].geometry.viewport);
                }
            });
        };

        //if (this.theFilter.prepared) {
        //    this.theFilter.FindNow();
        //};

    };

    angular
        .module('sw.common')
        .controller('ChoroplethController', ['$scope', 'geoJson', ctrlr]);



})();