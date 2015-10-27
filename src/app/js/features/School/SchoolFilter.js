
/*----------------------------------------------------------------------------------------------------------
    School Filter  - manages the specification of filter parameters, and fires a search event
    --------------------------------------------------------------------------------------------------------
*/
(function () {
    // This code is generated from Scholar reading the Access form

    var viewdefaults =  {
            columnSet: 0,
            columnDefs: [
                        
                        {
                            field: 'schNo', name: 'Sch No',
                            width: 80, pinnedLeft: true,

                            cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><a  ng-click="grid.appScope.listvm.action(\'item\',col.field, row.entity);">{{row.entity[col.field]}}</a></div>'


                        },
                        {
                            field: 'schName', name: 'Name',
                            width: 250, pinnedLeft: true
                        },

                        {
                            field: 'schType', name: 'schType',displayName: 'Type',
                            width: 60, cellClass: 'gdAlignCenter' 
                        },
                        {
                            field: 'schAuth', name: 'auth', displayName: 'Auth',
                            width: 80
                        },
                         {
                             field: 'schClass', name: 'class', displayName: 'R/U',
                             width: 50, cellClass: 'gdAlignLeft'
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
                SortColumn: 'SchNo',
                SortDir: 0

            },
            locked: {}
        };

        var fltr = basefilter.Create('school', api, defaultparams, tableparams, viewdefaults);

        //falsfind and paramdefaults
        angular.extend(fltr,
            {
                // note that we are defining these methods in the object, rather than in its prototype
                // which normally is not good practice.
                // However, becuase an angularJS Service is a singleton, the duplication
                // won't be a problem - only once instance is ever created of this 'class'
                FlashFind: flashFind,
                BuildFlashFind: buildFlashFind
            })

        return fltr;


        function flashFind(str) {
            str = (str || this.FlashString)
            this.Reset();
            if (str.trim().length == 0) {
                return;
            }
            var L;
            var parts = basefilter.Tokenise(str);
            var parsed = [];
            for (var i = 0; i < parts.length; i++) {

                // test for numeric
                var s = parts[i].trim();
                
                    // for non-numerics look for school type, district, authority, name
                    var S = s.toUpperCase();
                    var lkps;
                    var lkp;
                    var found = false;

                    
                    if (!found) {

                        if (_.find(Lookups.cache.schoolTypes, { 'C': S })) {
                            if (!this.params.SchoolType) {
                                this.params.SchoolType = S;
                                parsed.push(S);
                            }
                            found = true; // found even if there is already a country, otherwise it winds up somewhere else
                        }
                    }
                    if (!found) {

                        if (L =_.find(Lookups.cache.schoolTypes, function (d) { return d.N.toUpperCase() == S ||  d.N.toUpperCase() == S + ' SCHOOL'; })) {
                            if (!this.params.SchoolType) {
                                this.params.SchoolType = L.C;
                                parsed.push(s);
                            }
                            found = true; // found even if there is already a country, otherwise it winds up somewhere else
                        }
                    }
                    if (!found) {

                        if (_.find(Lookups.cache.districts, { 'C': S })) {
                            if (!this.params.District) {
                                this.params.District = S;
                                parsed.push(S);
                            }
                            found = true; // found even if there is already a district, otherwise it winds up somewhere else
                        }
                    }
                    if (!found) {
                    // use the function form of lodash find to handle case -insensitivity
                        if (L = _.find(Lookups.cache.districts, function (d) { return d.N.toUpperCase() == S; })) {
                            if (!this.params.District) {
                                this.params.District = L.C;   // but show the lower case
                                parsed.push(L.N);
                            }
                            found = true; // found even if there is already a country, otherwise it winds up somewhere else
                        }
                    }
                    // authorities
                      if (!found) {

                        if (_.find(Lookups.cache.authorities, { 'C': S })) {
                            if (!this.params.Authority) {
                                this.params.Authority = S;
                                parsed.push(S);
                            }
                            found = true; // found even if there is already a district, otherwise it winds up somewhere else
                        }
                    }
                    if (!found) {
                    // use the function form of lodash find to handle case -insensitivity
                        if (L = _.find(Lookups.cache.authorities, function (d) { return d.N.toUpperCase() == S; })) {
                            if (!this.params.Authority) {
                                this.params.Authority = L.C;   // but show the lower case
                                parsed.push(L.N);
                            }
                            found = true; // found even if there is already a country, otherwise it winds up somewhere else
                        }
                    }
                    if (!found) {
                        // make the name the default unless there is only a single term
                        if (s.indexOf('*') >= 0 || s.indexOf('?') >= 0 
                            || s.indexOf('%') >= 0 || s.indexOf(' ') >= 0
                            || s.indexOf('/') >= 0  || parts.length > 1) {
                            if (!this.params.SchoolName) {
                                this.params.SchoolName = s;
                                // if searching name, always search in alias and reg no
                                this.params.SearchAlias = 1;
                                this.params.SearchRegNo = 1;
                                parsed.push(s);
                                found = true;
                            }
                        }
                        else {
                            
                            if (!this.params.SchoolNo) {
                                this.params.SchoolNo = S;
                                parsed.push(S);
                                found = true;
                            }

                        }

                    }
            }
            this.FlashString = basefilter.Detokenise(parsed);
            if (parsed.length) {
                this.FindNow();
            }

        }

        function buildFlashFind() {

            var tt = ['SchoolNo', 'SchoolName', 'SchoolType', 'District', 'Authority'
            ]
            this.FlashStringBuilder(tt);
        }

    };

    angular
        .module("pineapples")
        .factory("SchoolFilter", ["$rootScope", "schoolsAPI", 'BaseFilter', 'Lookups', filter]);

})();

