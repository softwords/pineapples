// holdes some standard stuff applicable to any filter model

(function () {
    var basefilter = function ($rootScope, $state) {

        var base = {
            FindNow: findNow,
            Table: table,
            Geo: geo,
            Search: search,
            ShowPage: showPage,
            SortOn: sortOn,

            requestSearch: function () { this.needSearch = true; },
            requestTable: function () { this.needTable = true; },
            requestGeo: function () { this.needGeo = true; },

            Reset: reset,
            IsLocked: isLocked,

            GetViewMode: getViewMode,
            SetViewMode: setViewMode,
            SetUserSettings: setUserSettings,
            PushViewModes: pushViewModes,
            SelectedVM: selectedVM,

            Action: action,



            FixParams: fixparams,

            // flash find support
            BuildFlashFind: buildFlashFind,
            FlashStringBuilder: flashStringBuilder,
            GetParamString: getParamString,
            Tokenise: tokenise,
            Detokenise: detokenise,

            // these are low level methods that allow for more customisation from the owning filter

            //construct the promise represtning 'search'
            SearchPromise: searchPromise,
            // construct a general promise, passing the parameters
            ApiPromise: apiPromise,
            // handle a susccessful resolve of a promise by broadcasting the packaged data
            HandlePromise: handlePromise,
            // package and broadast a dataset
            BroadcastData: broadcastData,
            // convert the return pack into the data format that is exported
            // owning filters may override this
            TransformData: transformData,

            // utility function to set up subclasses
            Create: create

        };
        Object.defineProperty(base, 'ViewMode', {
            get: base.GetViewMode,
            set: base.SetViewMode
        });
        return base;

        //-------------------------------------------------------------
        // implementation
        //--------------------------------------------------------------
        // this is called when a searcher indicates that FindNow is clicked
        // other listeners may respond by asking the Filter to Search or get a Table
        function findNow() {
            this.BuildFlashFind();
            $rootScope.$broadcast('FindNow', { entity: self.entity, filter: this });
            if (this.needSearch) {
                this.needSearch = false;
                this.Search();
            }
            if (this.needTable) {
                this.needTable = false;
                this.Table();
            }
            if (this.needGeo) {
                this.needGeo = false;
                this.Geo();
            }

        }

        // general method to construct a promise
        function apiPromise(api, apimethod, params) {
            var self = this;
            var promise = api[apimethod](params);
            promise.method = apimethod;     // note this is a default, the caller may override
            return catchPromise(promise, self.entity);
        }


        // method to return the promise
        function searchPromise(api) {
            var self = this;
            // if a view mode is set, its columnSet should get pushed into the params
            // user defaults
            var vm = self.SelectedVM();
            if (vm && vm.columnSet) {
                this.params.ColumnSet = vm.columnSet;
            }
            else {
                this.params.ColumnSet = this.ViewDefaults.columnSet;
            }
            var apimethod = this.searchApi || 'filterPaged';
            var promise = apiPromise.call(self, api, apimethod, (fixparams(self, self.params)));
            promise.method = 'search';
            return promise;
        }

        // add a standard error reporting catch to the promise
        // * no dependency on 'this'
        function catchPromise(promise, entity) {
            
            promise
                .catch(
                    function (e) {
                        $rootScope.$broadcast('SearchError', { entity: entity, error: e });
                    });
            return promise;
        }

        function transformData(resultPack, method) {
            var self = this;
            self.summary = {
                numResults: resultPack.NumResults
                , firstRec: resultPack.FirstRec
                , lastRec: resultPack.LastRec
                , pageNo: resultPack.PageNo
                , pageSize: resultPack.PageSize
            };
            var entity = self.entity;
            // renderOptions added for maps only
            return { entity: entity, method: method, resultset: resultPack.ResultSet, summary: self.summary, renderOptions: {map: null}};
        }

        function broadcastData(data) {
            var self = this;
          
            $rootScope.$broadcast('SearchComplete', data);
            self.prepared = true;
        }

        function handlePromise(promise) {
            var self = this;
            promise.then(
                // return pack is an object with
                // data, headers, config, status and statustext
                function (resultPack) {
                    if (self.cacheResult !== undefined) {   // !== not != which matches undefined to any falsy
                        self.cacheResult = resultPack;
                    }
                    // processing of the recevied data before sending
                    var data = self.TransformData(resultPack, promise.method);
                    
                    self.BroadcastData(data);
                }
            );
        }
        
        function search(api) {
            var self = this;
            api = api || this.api;          // this is a temporary measure to allow basefilter to be used either as a prototype, or by inclusion
            var promise = searchPromise.call(self, api);
            self.HandlePromise(promise);
        };

        function table(api) {
            var self = this;
            api = api || this.api;          // this is a temporary measure to allow basefilter to be used either as a prototype, or by inclusion

            // appDS.filterPaged(self.theFilter).then(
            var params = { row: self.tableparams.row, col: self.tableparams.col, filter: self.params };
            var promise = apiPromise(api, 'table', params )
            self.HandlePromise(promise);
        };

        function geo(api) {
            var self = this;
            api = api || this.api;          // this is a temporary measure to allow basefilter to be used either as a prototype, or by inclusion
            var promise = apiPromise(api, 'geo', self.params)
            self.HandlePromise(promise);

        }

        function showPage(newPage, newPageSize) {
            this.params.PageNo = (newPage || 1);
            this.params.PageSize = (newPageSize || this.params.PageSize);
            this.FindNow();
        };
        function sortOn(sortField, sortDirection) {
            this.params.SortColumn = (sortField || 'appID');
            this.params.SortDir = (sortDirection || 'asc');
            this.ShowPage(1);

        }
        //------------------------------------------------------------
        // View Mode management
        //------------------------------------------------------------

        // pushViewModes
        // aceepts an array of viewModes and adds those to the current set,
        // overriding any that already exist

        function pushViewModes(modes) {
            var self = this;
            modes.forEach(function (mode) {
                var key = mode.key;
                var media = mode.media;
                _.remove(self.ViewModes, { key: mode.key , media: mode.media});
                self.ViewModes.push(mode);

            });
            // make sure there is a selected VM
            if (self.ViewMode == undefined) {
                self.ViewMode = self.ViewModes[0].key;
            }
            
        }
        
        function getViewMode() {
           
            return this.selectedVMName;
           
        };

        //select a viewMode by key (ie name)
        function setViewMode(newValue) {

            if (this.selectedVMName && this.selectedVMName == newValue)
                return;
            this.selectedVMName = newValue;

            if (this.prepared) {
                this.FindNow();
            }
            

        };

      
        function selectedVM() {
            var self = this;
            var vm = _.find(this.ViewModes, function (viewMode) { return (viewMode.key == self.selectedVMName); });
            return vm;

        };
        function setColumnSet(columnset) {
            this.params.ColumnSet = columnset;
        };

        function setUserSettings(settings) {
            this.UserSettings = settings;
            if (settings.allowedViews) {
                // settings .allowed views is an array of the supported view keys
                // filter the ViewModes collectio by membership of this array using lodash functions

                //this.ViewModes.modes = _.filter(this.AllViewModes.modes, function (mode) {
                //    return (_.indexOf(settings.allowedViews, mode.key) >= 0);;
                //});
            }
            else {
                //this.ViewModes.modes = _.filter(this.AllViewModes.modes, function (mode) {
                //    return (mode.selectable != false);
                //});
            };
            if (settings.defaultView) {
                this.SetViewMode(settings.DefaultView);
            };
            // reset the owning filter's params to reflect the new user settings
            this.Reset();
        };
        
        function reset() {
            // set up the parameters
            this.params = fixparams(this, {PageSize: this.params.PageSize, PageNo: 1});

            this.resultset = null;
            this.summary = null;
            this.FlashString = '';
        };

        function isLocked(paramname) {
            var d = this.ParamDefaults;
            if (d && d.locked && d.locked[paramname])
                return true;
            if (this.UserSettings && this.UserSettings.locked && this.UserSettings.locked[paramname])
                return true;
            return false;
        };

        function fixparams(fltr, params) {
            var newparams = {};
            var d = fltr.ParamDefaults;
            var u = fltr.UserSettings || {defaults: {}, locked: {}};
            angular.extend(newparams, d.defaults,u.defaults, params, d.locked, u.locked );
            return newparams;
          

        };
    // tokenise function is for splitting flash finds, but preserving as a sinle token anything contained in 'single quotes'
    // 
        function tokenise(str) {
            return swjs.splitargs(str);
        }

        function detokenise(arr) {
            var out = arr.map(function (token) {
                if (token.indexOf("'") >=0)
                    return '"' + token + '"';
                if (token.indexOf('"') >=0)
                    return "'" + token + "'";
                if (token.indexOf(' ') >= 0)
                    return "'" + token + "'";
                return token;

            });
            return out.join(" ");
        }
        // BuildFlashFind is virtual function that creates the flashfind from the params
        // called from FindNow

        function buildFlashFind() {
          
        }

    // helper routine to buid the flash string from an array of param names
    // this array should correspond to those parsed in FlashFind,
    // and they should be in the same order
        function flashStringBuilder(pp) {
            var self = this;
            var parsed = [];
            
            pp.forEach(function (p) {
                if (self.params[p]) {
                    
                    parsed.push(self.GetParamString(p,self.params[p]));
                }
            })

            this.FlashString = this.Detokenise(parsed);
        }
        // routine to get the flashfind string representing a parameter
        // normally this is just the identity
        // however for some cases (eg. when an Id is passed into the parameter)
        // it may need to be a string
        function getParamString(name, value) {
            return value.toString();
        }
        // default action is to invoke the <action> state under the current state, passing the clicked column, the row data, and the id?

        function action(actionName, columnField, rowData, baseState) {
            
            
            var newstate = baseState + '.' + actionName;
            $state.go(newstate, { id: rowData[columnField], rowData: rowData, columnField: columnField });

            
        };
        // a 'static' method!
        function create(entityname, api, defaultparams, tableparams, viewdefaults) {
            //this = basefilter here
            var fltr = Object.create(this);
            init.call(fltr,entityname, api, defaultparams, tableparams, viewdefaults);
            return fltr;
        }
        function init(entityname, api, defaultparams, tableparams, viewdefaults) {
            tableparams = tableparams || { row: null, col: null };
            viewdefaults = viewdefaults || {};
            angular.extend(this,
            {
                entity: entityname,
                api: api,
                params: {PageSize: 50, PageNo: 1},
                tableparams: tableparams,
                needSearch: false,
                needTable: false,
                needGeo: false,


                // flash searching
                FlashString: '',
                FlashFind: function () { throw 'Flashfind must be overriden'; },

                // ViewModes
                ViewDefaults: viewdefaults,
                ViewModes: [],
               
                //AllViewModes: viewModes,            // need this to be able to return to the full collection before filtering


                // paramater defaults
                ParamDefaults: defaultparams,
                UserSettings: { defaults: {}, locked: {} },

               
            });
            this.Reset();
        }
    };


    angular
    .module("sw.common")
    .factory("BaseFilter", ["$rootScope", "$state", basefilter]);

})();


