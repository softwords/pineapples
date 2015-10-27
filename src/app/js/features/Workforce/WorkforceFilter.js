
/*----------------------------------------------------------------------------------------------------------
    Teacher Filter  - manages the specification of filter parameters, and fires a search event
    --------------------------------------------------------------------------------------------------------
*/
(function () {
 
    var viewdefaults = {
        columnSet: 1,
        columnDefs: [
             {
                 field: 'tID', displayName: 'KEMIS ID', name: 'tID',
                 width: 90, cellClass: 'gdAlignRight'

             },
                    {
                        field: 'tSurname', name: 'Family Name',


                    },
                    {
                        field: 'tGiven', name: 'Given Name'
                    },
                    {
                        field: 'tSex', name: 'Gender',
                        width: 50, cellClass: 'gdAlignCenter'
                    },

                    {
                        field: 'tDOB', name: 'tDOB',
                        displayName: 'DoB', cellFilter: 'date',
                        width: 120, cellClass: 'gdAlignCenter'
                    },
                    {
                        field: 'tPayroll', name: 'Payroll',
                        width: 150, cellClass: 'gdAlignRight'
                    },

        ]

    };

    var filter = function ($rootScope, api, basefilter, Lookups) {
        var self = this;



        var tableparams = {
            row: "Country",
            col: "Gender"
        };
        var defaultparams = {
            defaults: {
                SortColumn: 'Surname',
                SortDir: 0

            },
            locked: {}
        };

        var fltr = basefilter.Create('teacher', api, defaultparams, tableparams, viewdefaults);

        //falsfind and paramdefaults
        angular.extend(fltr,
            {
                // note that we are defining these methods in the object, rather than in its prototype
                // which normally is not good practice.
                // However, becuase an angularJS Service is a singleton, the duplication
                // won't be a problem - only once instance is ever created of this 'class'
                FlashFind: flashFind,
                Action: action
            })

        return fltr;


        // action
        function action(actionName, columnField, rowData, baseState) {
            switch (actionName) {
                default:
                    basefilter.Action.call(this, actionName, columnField, rowData, baseState);
            };
        };

        function flashFind(str) {
            str = (str || this.FlashString)
            this.Reset();
            if (str.trim().length == 0) {
                return;
            }

            var parts = basefilter.Tokenise(str);
            var parsed = [];
            for (var i = 0; i < parts.length; i++) {

                // test for numeric
                var s = parts[i].trim();
                if ($.isNumeric(s)) {
                    var n = parseInt(s);
                    if (n > 1990 && n < 2050) {
                        if (!this.params.YearOfStudy)
                            this.params.YearOfStudy = n;

                    }
                    else {
                        // if there is only 1 part, assume its an ID number
                        if (!this.params.TeacherID) {
                            this.params.TeacherID = n;
                        }
                    }
                    parsed.push(s);
                }
                else {
                    // for non-numerics look explicitly for a gender, or a role
                    var S = s.toUpperCase();
                    var lkps;
                    var lkp;
                    var found = false;

                    if (S == "M" || S == "F") {
                        if (!this.params.Gender) {
                            this.params.Gender = S;
                            parsed.push(S);
                            found = true;
                        }
                    }


                    if (!found) {
                        if (s.indexOf('*') >= 0 || s.indexOf('?') >= 0 || s.indexOf('%') >= 0) {
                            if (!this.params.Surname) {
                                this.params.Surname = s;
                                parsed.push(s);
                                found = true;
                            }
                        }

                    }


                }

            }
            this.FlashString = basefilter.Detokenise(parsed);
            if (parsed.length) {
                this.FindNow();
            }

        }



    };
  

    angular
        .module("pineapples")
        .factory("WorkforceFilter", ["$rootScope", "workforceAPI", 'BaseFilter', 'Lookups', filter]);

})();

