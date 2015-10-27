
/*----------------------------------------------------------------------------------------------------------
    Teacher Filter  - manages the specification of filter parameters, and fires a search event
    --------------------------------------------------------------------------------------------------------
*/
(function () {
    // This code is generated from Scholar reading the Access form

    var viewModes = {
        defaults: {
            columnSet: 1,
            columnDefs: [

                        {
                            field: 'schNo', name: 'Sch No'
                        },
                        {
                            field: 'schName', name: 'Name',
                            width: 150, cellClass: 'gdAlignCenter'
                        },

                        {
                            field: 'schType', name: 'schType',
                            displayName: 'Type',
                            width: 120, cellClass: 'gdAlignCenter'
                        },

            ]

        },
        modes: [
            {
                key: "Location",
                gridOptions: {
                    columnDefs: [



                    ]
                }
            },
            {
                key: "Latest Survey",
                columnSet: 2,
                gridOptions: {
                    columnDefs: [

                    ]  // columndefs
                }       // gridoptions
            }           //mode
        ]               // modes
    };






    var filter = function ($rootScope, api, basefilter, Lookups) {
        var self = this;



        var tableparams = {
            row: "Country",
            col: "Gender"
        };
        var defaultparams = {
            defaults: {
                SortColumn: 'SchNo',
                SortDir: 0

            },
            locked: {}
        };
        var fltr = basefilter.Create('school', api, defaultparams, tableparams);

        //falsfind and paramdefaults
        angular.extend(fltr,
            {
                // note that we are defining these methods in the object, rather than in its prototype
                // which normally is not good practice.
                // However, becuase an angularJS Service is a singleton, the duplication
                // won't be a problem - only once instance is ever created of this 'class'
                FlashFind: flashFind,

                DataSets: [
                    { n: "Enrolment", v: "pSchoolRead.SchoolDataSetEnrolment" },
                    { n: "Repeaters", v: "pSchoolRead.SchoolDataSetRepeaterCount" },
                    { n: "Teachers", v: "pSchoolRead.SchoolDataSetTeacherCount" },
                    { n: "TeachersQualCert", v: "pSchoolRead.SchoolDataSetQualCertCount" },
                    { n: "TeachersQualCertPerc", v: "pSchoolRead.SchoolDataSetQualCertPerc" }
                ],
                Swap: swap
            })

        fltr.Reset();
        fltr.AllViewModes = viewModes;
        fltr.ViewModes.defaults = viewModes.defaults;
        fltr.ViewModes.modes = viewModes.modes;
        fltr.ViewMode = fltr.ViewModes.modes[0].key;
        return fltr;


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

        function swap() {
            var was = angular.copy(this.params);
            this.params.XSeries = was.YSeries;
            this.params.YSeries = was.XSeries;
            this.params.XSeriesOffset = was.YSeriesOffset;
            this.params.YSeriesOffset = was.XSeriesOffset;
            this.FindNow();
        }

    };

    angular
        .module("pineapples")
        .factory("SchoolScatterFilter", ["$rootScope", "schoolScatterAPI", 'BaseFilter', 'Lookups', filter]);

})();

