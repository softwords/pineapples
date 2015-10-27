(function () {


  var modes = [
        {
            key: "Location",
            columnSet: 0,
            gridOptions: {
                columnDefs: [

                   {
                       field: 'iName', name: 'island',
                       displayName: 'Island',
                       width: 120, cellClass: 'gdAlignLeft'
                   },
                   {
                       field: 'dName', name: 'district',
                       displayName: 'District',
                       width: 110, cellClass: 'gdAlignLeft'
                   },

                    {
                        field: 'schVillage', name: 'village',
                        displayName: 'Village',
                        width: 150, cellClass: 'gdAlignLeft'
                    },
                    {
                        field: 'schLat', name: 'LatLng',
                        displayName: 'Lat/Lng',
                        width: 150,
                        cellTemplate: '<div class="ui-grid-cell-contents"><a  ng-click="grid.appScope.listvm.action(\'latlng\',\'schNo\', row.entity);">[{{row.entity.schLat | number:4}}, {{row.entity.schLong |number:4}}]</a></div>'
                    },
                ]
            }
        },
        {
            key: "Latest Survey",
            columnSet: 1,
            gridOptions: {
                columnDefs: [
                       {   field: 'svyYear', name: 'svyYear', displayName: 'Svy Year',
                       width: 80 ,
                       },
                       {   field: 'ssEnrol', name: 'ssEnrol', displayName: 'Enrol',
                       width: 80,cellClass: 'gdAlignRight'
                       },
                       {   field: 'ssEnrolM', name: 'ssEnrolM', displayName: 'Enrol M',
                       width: 80, cellClass: 'gdAlignRight'
                       },
                       {   field: 'ssEnrolF', name: 'ssEnrolF', displayName: 'Enrol F',
                       width: 80, cellClass: 'gdAlignRight'
                       },
                       {   field: 'TNum', name: 'TNum', displayName: 'Tchrs',
                       width: 80, cellClass: 'gdAlignRight'
                       },



                ]  // columndefs
            }       // gridoptions
        }           //mode
    ];              // modes

    var pushModes = function (filter) {
        filter.PushViewModes(modes);
    };

    angular
        .module('pineapples')
        .run(['SchoolFilter',pushModes])
})();