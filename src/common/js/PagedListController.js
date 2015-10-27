(function () {
    /* 
      --------------------------------------------------------------------
      Paged List Controller
    
      manages the display of a list of applications
      --------------------------------------------------------------------
      */
    // calculate the wodth of a set of columns
    // assumes each columndef has a width attribute, in px

    var colwidths = function (columndefs, start, end) {
        var tot = 0;
        for (var i = start; i <= end; i++) {
            tot += parseFloat(columndefs[i].width);
        }
        return tot;

    };

    var pagedListController = function ($scope,  $state, $stateParams, filter) {
        var self = this;

        this.theFilter = filter;

        this.resultset;

        $scope.extern = $scope;
        this.isWaiting = false;

        //$state ( .current.data) is probably a better place to put configuration info
        this.pagination = {};
        this.runOnLoad = false;

        this.gridClass;                 // a top level class for the grid - can invoke a different 

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
 
 
        self.renderedViewMode = '';      // that's how its been initilaised        
        self.renderedPageNo = 1;
        self.renderedPageSize = 50;

        self.baseState = $state.current.name;

        self.action = function (actionName, columnField, rowData) {
            self.theFilter.Action(actionName, columnField, rowData, self.baseState);
        }
      
        // utilities for grid management
        self.columnWidths = colwidths;


        var baseOptions = {
          

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
                // at this point we can see if we need to run
                // also, if this Filter has already been searched, tell it we want to search again
                
                if (self.runOnLoad || self.theFilter.prepared) {
                    self.theFilter.FindNow();
                }
                
            }



        };

        this.gridOptions = angular.copy(baseOptions);

        $scope.$on('SearchComplete', function (event, resultpack) {
            
            if (resultpack.entity == self.theFilter.entity && resultpack.method == 'search') {

                self.resultset = resultpack.resultset;
                if (self.theFilter.ViewMode != self.renderedViewMode) {
                    var cd = new Array();
                    var vm = self.theFilter.SelectedVM();
                    // set the gridClass from the view mode
                    self.gridClass = vm.gridClass;

                    // clear the current gridOptions
                    if (self.theFilter.ViewDefaults.columnDefs)
                    {
                        // append these columns to the set
                        cd = cd.concat(self.theFilter.ViewDefaults.columnDefs);
                    }
                    
                    // overwrite those columndefs
                    cd = cd.concat(vm.gridOptions.columnDefs);
                    var newOptions = {};
                    angular.extend(newOptions,baseOptions, vm.gridOptions);
                    newOptions.columnDefs = cd;
                    self.gridOptions = angular.copy(newOptions);
                    self.renderedViewMode = self.theFilter.ViewMode;
                    // step through other properties of the vm.gridOptions, and apply them to the current gridOptions
                    
                }


                self.gridOptions.data = self.resultset;
                self.gridOptions.totalItems = resultpack.summary.numResults;
                if (resultpack.summary.numResults > 0 && self.pagination.enablePagination)  {
                    
                    if (self.gridOptions.paginationCurrentPage != resultpack.summary.pageNo) {
                        
                        self.gridOptions.paginationCurrentPage = resultpack.summary.pageNo;
                    }
                    if (self.gridOptions.paginationPageSize != resultpack.summary.pageSize) {
                        self.gridOptions.paginationPageSize = resultpack.summary.pageSize;
                    }
                    self.renderedPageNo = resultpack.summary.pageNo
                    self.renderedPageSize = resultpack.summary.pageSize;
                };
                // temporary fix ? rowHeight does not seem to get propogated from gridOptions
                // to grid.options (see GridRow in UI source code)
                // so we can push it here
                var liveOptions = self.gridApi.grid.options;

                angular.extend(liveOptions, self.gridOptions);
                // if we are already in item state, and there is only one record returned, and filter lets us
                // go to item state again
                if ($state.current.name == self.baseState + '.item'
                              && resultpack.summary.numResults == 1) {
                    self.action('item', self.theFilter.ViewDefaults.columnDefs[0].field, self.resultset[0]);
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
                //data.filter.params.ColumnSet = (vm.columnSet == 'undefined' ?self.theFilter.ViewDefaults.ColumnSet: vm.columnSet);
                data.filter.requestSearch();
                self.isWaiting = true;
            }

        });

       

    };
  
    angular
        .module('sw.common')
        // theFilter will be injected by ui-router resolve 
        .controller('PagedListController', ['$scope', '$state', '$stateParams', 'theFilter', pagedListController])

})();