(function () {
    /*
    School Map View helper

    this service provides handlkers for creating markers for schools
    These handlers are called by the MapController when required

    */
    // return the icon to represent the row data - ie the school

  

    var st0 ;
    var st1 ;
    var st2 ;
    var st3 ;
    var st4 ;
    var st5 ;

    function rowIcon(row, ignoreColoc) {
        if (!ignoreColoc && (row.coloc > 1)) {

            return this.Icons.circle.default;

            //    };
        };
        var icon = this.Icons.circle;
        switch (row.SchoolType) {
            case 'PS':
                return st0;
                break;
            case 'CHS':
                return st1;
            case 'ECE':
                return st2;

            case 'PSS':
                return st3;

            case 'NSS':
                return st4;


        }
        return icon.default;


    };

    var mvh = function (basehelper) {
        var helper = basehelper.Create();
        angular.extend(helper,
        {
            LatField: 'Lat',
            LngField: 'Lng',
            TitleField: 'Name',

            RowIcon: rowIcon
        });

          function makeIcon(color) {
                var icon = angular.copy(basehelper.Icons.circle.default);
                icon.fillColor = color;
                return icon;
            }
        st0 = makeIcon('green');
        st1 = makeIcon('red');
        st2 = makeIcon('blue');
        st3 = makeIcon('orange');
        st4 = makeIcon('yellow');
        st5 = makeIcon('purple');

        return helper;
    };

    angular
        .module('pineapples')
        .factory('SchoolMapView', ['baseMapView', mvh])


})();