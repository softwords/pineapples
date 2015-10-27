(function () {


    var modes = 
       [
            {
                key: "Employment",
                gridOptions: {
                    columnDefs: [

                        {
                            field: 'tDatePSAppointed', cellFilter: 'date',
                            displayName: 'PS Appointed', name: 'tDatePSAppointed'
                        },
                        {
                            field: 'tDatePSClosed', displayName: 'PS End', name: 'tDatePSClosed', cellFilter: 'date'
                        },
                        {
                            field: 'tRegister', displayName: 'Tch Reg.',
                            width: 150,
                            cellClass: 'gdAlignRight'
                        },
                        {
                            field: 'tDateRegister',
                            cellFilter: 'date',
                            displayName: 'Reg Date',
                            name: 'tDateRegister'
                        },
                        {
                            field: 'tProvident',
                            name: 'Prov Fund',
                            width: 150,
                            cellClass: 'gdAlignRight'
                        },
                        {
                            field: 'tDateRegisterEnd',
                            cellFilter: 'date',
                            displayName: 'Reg End',
                            name: 'tDateRegisterEnd'
                        },
                        {
                            field: 'tYearStarted',
                            cellFilter: 'date',
                            displayName: 'Started Teaching',
                            name: 'tYearStarted'
                        },
                        {
                            field: 'tYearEnded',
                            displayName: 'Finished Teaching',
                            name: 'tYearEnded'
                        },


                    ]
                }
            },
            {
                key: "Latest Survey",
                columnSet: 2,
                gridOptions: {
                    columnDefs: [
                       
                    
                        {
                            field: 'tSex', name: 'Gender',
                            width: 50,
                            cellClass: 'gdAlignCenter'
                        },

                        {
                            field: 'tDOB', name: 'tDOB', displayName: 'DoB',
                            cellFilter: 'date',
                            width: 120, cellClass: 'gdAlignCenter'
                        },
                        {
                            field: 'tPayroll', name: 'Payroll',
                            width: 100, cellClass: 'gdAlignRight'
                        },
                        {
                            field: 'svyYear',name: 'Year',
                            width: 60, cellClass: 'gdAlignRight',
                            enableSorting: false
                        },
                        {
                            field: 'schNo', name: 'Sch No',
                            width: 80, cellClass: 'gdAlignLeft',
                            enableSorting: false
                        },
                        {
                            field: 'schName', name: 'Sch Name',
                            width: 150, cellClass: 'gdAlignLeft',
                            enableSorting: false
                        },
                        {
                            field: 'tchStatus', name: 'Status',
                            width: 50, cellClass: 'gdAlignLeft',
                            enableSorting: false
                        },
                        {
                            field: 'tchRole', name: 'Role',
                            width: 60,
                            cellClass: 'gdAlignLeft',
                            enableSorting: false
                        },
                         {
                             field: 'tchTAM', name: 'Duties',
                             width: 80,
                             cellClass: 'gdAlignLeft',
                             enableSorting: false
                         },
                          {
                              field: 'tchHouse',
                              name: 'House?',
                              width: 80,
                              cellClass: 'gdAlignLeft',
                              enableSorting: false
                          }

                    ]  // columndefs
                }       // gridoptions
            }           //mode
    ];              // modes

    var pushModes = function (filter) {
        filter.PushViewModes(modes);
    };

    angular
        .module('pineapples')
        .run(['WorkforceFilter', pushModes])
})();