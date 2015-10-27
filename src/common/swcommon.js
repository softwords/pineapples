/*
    swjs namespace
*/
var swjs = swjs || {};

// Route Helper
(function () {
  
        
        function listState(allowedViews, defaultView) {
            var state = {
                // all these are the same becuase the variation is in the Filter object
          
                url: '/list',
                data: {
                    roles: ['scholarUser'],
                    allowedViews: allowedViews,
                    defaultView: defaultView

                },
                views: {
                    "navbar@": {
                        templateUrl: "common/PagedListParams",
                        controller: "ViewModeController",
                        controllerAs: "listvm"
                    },
                    "@": {
                        templateUrl: "common/PagedList",       // begin move to server-side mvc routes
                        controller: 'PagedListController',
                        controllerAs: "listvm"
                    }
                }
            };
            return state;
        };
        function editableListState(allowedViews, defaultView) {
            var state = {
                // all these are the same becuase the variation is in the Filter object

                url: '/list',
                data: {
                    roles: ['scholarUser'],
                    allowedViews: allowedViews,
                    defaultView: defaultView
                },
                views: {
                    "navbar@": {
                        templateUrl: "common/PagedListParams",
                        controller: "ViewModeController",
                        controllerAs: "listvm"
                    },
                    "@": {
                        templateUrl: "common/PagedListEditable",       // begin move to server-side mvc routes
                        controller: 'PagedListEditableController',
                        controllerAs: "listvm"
                    }
                }
            };
            return state;
        };
        function chartState(featurename) { 
            var state =  {
                url: '/chart',

                views: {
                    "navbar@": {
                        templateUrl: "common/chartparams",        // local becuase we have to get acess to the data layer
                        controller: "FilterController",
                        controllerAs: "vm"
                    },
                    "@": {
                        templateUrl: "common/chart",
                        controller: "ChartController",
                        controllerAs: "chtc"
                    }
                }
            };
            return state;
        };
        function tableState(featurename) {
            var state =  {
                url: '/table',

                views: {
                    "navbar@": {
                        templateUrl: "common/chartParams",  
                        controller: "FilterController",
                        controllerAs: "vm"
                    },
                    "@": {
                        templateUrl: "common/table",
                        controller: "ChartController",
                        controllerAs: "chtc"
                    }

                }
            };
            return state;
        };
        function mapState(mapview) {
            if (!mapview) {
                mapview = 'baseMapView';
            };
            var state = {
                url: '/map',
                views: {
                    "navbar@": {
                        templateUrl: "common/MapParams",
                        controller: "MapParamsController",
                        controllerAs: "mappc"
                    },
                    "@": {
                        templateUrl: "common/map",
                        controller: "MapController",
                        controllerAs: "mapc"
                    }
                },
                resolve: {
                    mapView: mapview
                }
            };
            return state;
        };

    // featurename matches the Web Api controller
    // filtername is the filtername js class
    // templatepath matches the mvc controller that dispenses the templates

    // tableOptions is a member of Lookups.cahce, which is the dropdown on table and charts pages
        function tb(tableOptions) {
            return function () {
                return tableOptions;
            }
        }
        
        function featureState(featurename, filtername, templatepath, url, usersettings, tableoptions) {
            var defUserSettings = { defaults: {}, locked: {} };
            usersettings = usersettings || defUserSettings;
            filtername = filtername || featurename + 'Filter';
            featurename = featurename.toLowerCase();
            templatepath = templatepath || featurename;
            url = (url || featurename);
            var state = {
                url: '/' + url,
                data: {
                    roles: ['authenticated']
                },
                views: {
                    "headerbar@": {
                        templateUrl: function () { return templatepath + "/searcher"; },            // mvc formulation allows server-side logic to choose searher version, function encapsulation allows future client override too
                        controller: "FilterController",
                        controllerAs: "vm",

                    },
                    "headerbardropdownIcon@": { template: '<i class="fa fa-filter" tooltip="Show Filter" tooltip-placement="right"></i>'},
                    "flashFind@": {
                        templateUrl: "common/flashfindsearch",
                        controller: "FilterController",
                        controllerAs: "vm"
                    },
                    "flashFindCollapsed@": {template: '<i class="fa fa-bolt opacity-control"></i>'}
                },
                resolve: {
                    theFilter: filtername,
                    UserSettings: [filtername, function (fltr) {
                        fltr.SetUserSettings(usersettings);

                    }],
                    tableOptions: tb(tableoptions)   // tableoptions has to be enclosed in ' ' to be treated as a string literal
                }
            };
            return state;
        };

        function addFeatureState($stateProvider, featurename, filtername, templatepath, url, usersettings, tableoptions) {
            var state = featureState(featurename, filtername, templatepath, url, usersettings, tableoptions);
            var statename = 'site.' + featurename.toLowerCase();
            $stateProvider
                .state(statename, state);
            return this;
        }

        function addlistState($stateProvider, featurename, allowedViews, defaultView) {
            var state = listState(allowedViews, defaultView);
            var statename = 'site.' + featurename.toLowerCase() + '.list';
            $stateProvider
                .state(statename, state);
            return this;
        }

        function addeditablelistState($stateProvider, featurename,allowedViews, defaultView) {
            var state = editableListState(allowedViews, defaultView);
            var statename = 'site.' + featurename.toLowerCase() + '.list';
            $stateProvider
                .state(statename, state);
            return this;
        }

        function addchartState($stateProvider, featurename) {
            var state = chartState(featurename);
            var statename = 'site.' + featurename.toLowerCase() + '.chart';
            $stateProvider
                .state(statename, state);
            return this;
        }

        function addtableState($stateProvider, featurename) {
            var state = tableState(featurename);
            var statename = 'site.' + featurename.toLowerCase() + '.table';
            $stateProvider
                .state(statename, state);
            return this;
        }

        function addmapState($stateProvider, featurename, mapview) {
            var state = mapState(mapview);
            var statename = 'site.' + featurename.toLowerCase() + '.map';
            $stateProvider
                .state(statename, state);
            return this;
        }


        swjs.routeHelper = {
            listState: listState,
            featureState: featureState,
            addFeatureState: addFeatureState,
            addListState: addlistState,
            addEditableListState: addeditablelistState,
            addChartState: addchartState,
            addTableState: addtableState,
            addMapState: addmapState,

        };
})();

(function () {
    "use strict";
    // thanks to https://github.com/elgs/splitargs

   var splitargs = function (input, separator) {
        separator = separator || /\s/g;
        var singleQuoteOpen = false;
        var doubleQuoteOpen = false;
        var tokenBuffer = [];
        var ret = [];

        var arr = input.split('');
        for (var i = 0; i < arr.length; ++i) {
            var element = arr[i];
            var matches = element.match(separator);
            if (element === "'") {
                if (!doubleQuoteOpen) {
                    singleQuoteOpen = !singleQuoteOpen;
                    continue;
                }
            } else if (element === '"') {
                if (!singleQuoteOpen) {
                    doubleQuoteOpen = !doubleQuoteOpen;
                    continue;
                }
            }

            if (!singleQuoteOpen && !doubleQuoteOpen) {
                if (matches) {
                    if (tokenBuffer && tokenBuffer.length > 0) {
                        ret.push(tokenBuffer.join(''));
                        tokenBuffer = [];
                    }
                } else {
                    tokenBuffer.push(element);
                }
            } else if (singleQuoteOpen) {
                tokenBuffer.push(element);
            } else if (doubleQuoteOpen) {
                tokenBuffer.push(element);
            }
        }
        if (tokenBuffer && tokenBuffer.length > 0) {
            ret.push(tokenBuffer.join(''));
        }
        return ret;
   };

   swjs.splitargs = splitargs;
})();
(function () {
    angular
        .module('sw.common', []);
})();