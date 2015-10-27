(function () {
    /* 
      --------------------------------------------------------------------
      Paged List Controller
    
      manages the display of a list of applications
      --------------------------------------------------------------------
      */

    var pagedListController = function ($scope, $state, $stateParams, filter) {
        var self = this;

        this.theFilter = filter;

        this.resultset;

        $scope.extern = $scope;
        this.isWaiting = false;

        //$state ( .current.data) is probably a better place to put configuration info
        this.pagination = {};
        this.runOnLoad = false;

        var statedata = $state.current.data;

        if (statedata) {
            if (statedata.pagination) {
                this.pagination = statedata.pagination;
            };
            this.runOnLoad = statedata.runOnLoad || false;
        }

        if (this.pagination.enablePagination == undefined) {
            this.pagination.enablePagination = true;
        }




        //if ($stateParams.supportedViewModes) {
        //    this.SupportedViewModes = $stateParams.supportedViewModes;
        //}
        //else {
        //    this.SupportedViewModes = _.pluck(filter.ViewModes.modes, 'key');
        //}
        //this.defaultColumnSet = $stateParams.defaultColumnSet || filter.ViewModes.defaults.columnSet || 1;


        self.renderedViewMode = '';      // that's how its been initilaised        
        self.renderedPageNo = 1;
        self.renderedPageSize = 50;

        self.baseState = $state.current.name;

        self.action = function (actionName, columnField, rowData) {
            self.theFilter.Action(actionName, columnField, rowData, self.baseState);
        };

        self.SaveRow = function (rowEntity, force) {
            if (force) {
                // set the row dirty first
                self.SetDirty([rowEntity]);
            }
            var promise = self.theFilter.SaveRow(rowEntity);
            self.gridApi.rowEdit.setSavePromise(rowEntity, promise);
        };

        self.SetDirty = function (rowEntities) {

            self.gridApi.rowEdit.setRowsDirty(rowEntities);
        }


        this.gridOptions = {
            data: self.resultset,

            paginationPageSizes: [10, 25, 50, 100, 500],
            paginationPageSize: 25,

            enablePagination: self.pagination.enablePagination,
            enablePaginationControls: self.pagination.enablePagination,
            useExternalPagination: self.pagination.enablePagination,
            useExternalSorting: self.pagination.enablePagination,

            onRegisterApi: function (gridApi) {
                self.gridApi = gridApi;
                self.gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
                    // only requery if useExternalSorting
                    if (self.pagination.enablePagination) {

                        if (sortColumns.length == 0) {
                            self.theFilter.SortOn();
                        } else {
                            self.theFilter.SortOn(sortColumns[0].field, sortColumns[0].sort.direction);
                        }
                    }
                });
                self.gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                    if (self.pagination.enablePagination) {
                        if (+newPage != +self.renderedPageNo || +pageSize != +self.renderedPageSize) {
                            self.theFilter.ShowPage(newPage, pageSize);
                        };
                    };
                });
                // required for saving
                self.gridApi.rowEdit.on.saveRow($scope, self.SaveRow);
                // at this point we can see if we need to 
                // also, if this Filter has already been searched, tell it we want to search again

                if (self.runOnLoad || self.theFilter.prepared) {
                    self.theFilter.FindNow();
                }

            }



        };


        $scope.$on('SearchComplete', function (event, resultpack) {

            if (resultpack.entity == self.theFilter.entity && resultpack.method == 'search') {

                self.resultset = resultpack.resultset;
                if (self.theFilter.ViewMode != self.renderedViewMode) {
                    var cd = new Array();
                    var vm = self.theFilter.SelectedVM();
                    if (self.theFilter.ViewDefaults.columnDefs) {
                        // append these columns to the set
                        cd = cd.concat(self.theFilter.ViewDefaults.columnDefs);
                    }
                    cd = cd.concat(vm.gridOptions.columnDefs);
                    self.gridOptions.columnDefs = cd;
                    self.renderedViewMode = self.theFilter.ViewMode;
                }


                self.gridOptions.data = self.resultset;
                self.gridOptions.totalItems = resultpack.summary.numResults;
                if (resultpack.summary.numResults > 0 && self.pagination.enablePagination) {

                    if (self.gridOptions.paginationCurrentPage != resultpack.summary.pageNo) {

                        self.gridOptions.paginationCurrentPage = resultpack.summary.pageNo;
                    }
                    if (self.gridOptions.paginationPageSize != resultpack.summary.pageSize) {
                        self.gridOptions.paginationPageSize = resultpack.summary.pageSize;
                    }
                    self.renderedPageNo = resultpack.summary.pageNo
                    self.renderedPageSize = resultpack.summary.pageSize;
                };
            }
            self.isWaiting = false;
        });

        $scope.$on('SearchError', function (event, resultpack) {
            if (resultpack.entity == self.theFilter.entity) {
                // no point waiting around - this train aint comin'
                self.isWaiting = false;
            }
        });

        $scope.$on('FindNow', function (event, data) {
            if (data.filter.entity == self.theFilter.entity) {
                var vm = self.theFilter.SelectedVM();
                //data.filter.SetColumnSet(vm.columnSet == 'undefined' ? self.theFilter.ViewDefaults.ColumnSet : vm.columnSet);
                data.filter.requestSearch();
                self.isWaiting = true;
            }

        });



    };
  
    angular
        .module('sw.common')
        // theFilter will be injected by ui-router resolve 
        .controller('PagedListEditableController', ['$scope', '$state', '$stateParams', 'theFilter', pagedListController])
})();