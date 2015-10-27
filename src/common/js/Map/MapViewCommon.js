(function () {
    /*
    Base Map View helper

    this service provides handlkers for creating markers for maps
    These handlers are called by the MapController when required
    this is the default implementation which may be subclassed (object.Create())
    */
    // return the icon to represent the row data - ie the person or school or....

    var mvhelper = function () {

        var mvh = {
            RowIcon: rowIcon,
            MakeMarker: makeMarker,
            Icons: icons,
            Spiderfy: function () { return true; },
            Cluster: function () { return true; },

            LatField: 'sLat',
            LngField: 'sLng',
            TitleField: 'sFullName',

            // interactivity
            InfoWindowOptions: infoWindowOptions,
            InfoWindowContent: infoWindowContent,
            OnMarkerClick: onMarkerClick,
            // click event for spiderfier 
            OnSpiderClick: onSpiderClick,

            // subclass
            Create: create
        }
        return mvh;
    }


    function rowIcon(row, ignoreColoc) {
        var icon = null;
        if (!ignoreColoc && (row.coloc > 1)) {
            
                return this.Icons.circle.default;
            
            //    };
        };
        switch (row.sGender) {
            case 'M':
                icon = this.Icons.mars;
                break;
            case 'F':
                icon = this.Icons.venus;
        }
        return icon.default;


    };

    // path: 'M 200 100 m0,300 v150 m -75,-75 h150 M 200 100 m 106 43  l106 -106 m -75 0 h 75 m0 75 v -85 M 200 100 a 150 150 0 1 0 0.1 0 Z ',
    var mars = {
        path: 'M 200 100 m 106 43  l106 -106 m -75 0 h 75 m0 75 v -85 M 200 100 a 150 150 0 1 0 0.1 0 Z ',

        //path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
        anchor: new google.maps.Point(200, 250),

        fillColor: '#f88',
        fillOpacity: 0.9,
        scale: .05,
        strokeColor: 'black',
        strokeWeight: 2
    };

    var venus = {
        path: 'M 200 100 m0,300 v150 m -75,-75 h150 M 200 100 a 150 150 0 1 0 0.1 0 Z ',
        //path: ' m47,59H28m9.5,10V46.2a18.3,18.3 0 1,1 .1,0',
        //path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
        anchor: new google.maps.Point(200, 250),

        fillColor: '#88f',
        fillOpacity: 0.9,
        scale: .05,
        strokeColor: 'black',
        strokeWeight: 2
    };

    var circle = {
        path: 'M 200 100 a 150 150 0 1 0 0.1 0 Z ',
        //path: ' m47,59H28m9.5,10V46.2a18.3,18.3 0 1,1 .1,0',
        //path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
        anchor: new google.maps.Point(200, 250),

        fillColor: '#DDD',
        fillOpacity: 0.9,
        scale: .07,
        strokeColor: 'black',
        strokeWeight: 2
    };

    var icons = {
        mars: {
            default: mars
        },
        venus: {
            default: venus
        },
        circle: {
            default: circle
        },



    }

    
    function makeMarker(row, maptarget) {
        var latLng = new google.maps.LatLng(row[this.LatField], row[this.LngField]);
        var icon;


        // add the markers to the spiderfier
        var marker = new google.maps.Marker({
            position: latLng,
            title: (row.coloc > 1 ? row.coloc + ' people here...' : row[this.TitleField]),
            map: maptarget,
            icon: this.RowIcon(row)
        });
        marker.row = row;
     
        return marker;
    };

    /// Interactivity

    var infoWindow;     // placehlder for a single, resued infowindow
    // return a GM InfowWindowOptions object, base on the row /map / marker
    function infoWindowOptions(row, marker, map) {
        var iw = {
            content: this.InfoWindowContent(row,marker,map)
        }
        return iw;
    }

    // return the html to use as the info window content
    function infoWindowContent(row,marker,map) 
    {
        return '<div>' + row[this.TitleField] + '</div>';
    }

    // RETURNS the listener function
    function onMarkerClick(row, marker, map) {
        var self = this;
        function f() {
            if (infoWindow !== void 0) {    //see http://stackoverflow.com/questions/1291942/what-does-javascriptvoid0-mean
                infoWindow.close();
            }
            // create new window
            var infoWindowOptions = self.InfoWindowOptions(row, marker, map);
            infoWindow = new google.maps.InfoWindow(infoWindowOptions);
            infoWindow.open(map, marker);
        };
        return f;
    }

    // RETURNS the function(marker,event) that is passed a reference to the clicked marker
    function onSpiderClick(spiderfier, map) {
        var self = this;
        function f(marker,event) {
            if (infoWindow !== void 0) {    //see http://stackoverflow.com/questions/1291942/what-does-javascriptvoid0-mean
                infoWindow.close();
            }
            // create new window
            var infoWindowOptions = self.InfoWindowOptions(marker.row, marker, map);
            infoWindow = new google.maps.InfoWindow(infoWindowOptions);
            infoWindow.open(map, marker);
        };
        return f;
    }
    
    // a 'static' method!
    function create() {
        //this = basefilter here
        var fltr = Object.create(this);
        init.call(fltr);
        return fltr;
    }
    function init() {
//        angular.extend(this,
 //       {
//        });
    }
    


    angular
        .module('sw.common')
        .factory('baseMapView', mvhelper)

})();