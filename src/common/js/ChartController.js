/* 
--------------------------------------------------------------------
Chart Controller

manages the display of a chart of based on tabular data
--------------------------------------------------------------------
*/
(function () {

    var chartController = function ($scope, filter,lookups) {
        var self = this;

        self.isWaiting = false;


        /* Chart options */
        this.x = function (d) {
            return d.C;
        },
        this.y = function (d) {
            return d.Num;
        },

        this.theFilter = filter;

        this.Ready = false;

        //this.matchField = function (value, index, ar) {
        //    return (value[this.field] == this.value);

        //}

        this.dp = function (dataIn, series, cat, val) {
            var d = [];
            var sm = {};
            var sf = {};
            return d3.nest()
                    .key(function (d) { return d.R; })
                    .entries(dataIn);
        }


        this.xtab = function (dataIn) {
            // this cross tabs the data
            /*
            {key: "<>", values: {<>: 1, F: 2, M: 7}}
            */
            d3.nest()
                      .key(function (d) { return d.R; })

                      .rollup(function (d) {
                          return d.reduce(function (p, c) { p[c.C] = c.Num; return p; }, {})
                      })

                      .entries(self.data);
        }

        this.data = [];
        this.xtabdata = this.xtab(this.data);


        // the FindNow button got pushed - we need to redraw the chart
        $scope.$on('FindNow', function (event, data) {
            if (data.filter.entity == self.theFilter.entity) {
                data.filter.requestTable();
                self.Ready = true;      // to get the waiting gif to display
                self.isWaiting = true;
            }

        });

        $scope.$on('SearchComplete', function (event, resultpack) {
            if (resultpack.entity == self.theFilter.entity && resultpack.method == 'table') {
                self.resultset = resultpack.resultset;
                self.summary = resultpack.summary;
                //self.data = self.dp(resultpack.resultset, "R", "C", "Num");
                // dimple expects a simpler set of data
                self.data = resultpack.resultset;
                self.xtabdata = d3.nest()
                      .key(function (d) { return d.R; })
                      .sortKeys(d3.ascending)
                      .rollup(function (d) {
                          return d.reduce(function (p, c) {
                              if (c.Num) {
                                  p[c.C] = (p[c.C] ? p[c.C] : 0) + c.Num; p.Total = (p.Total ? p.Total : 0) + c.Num;
                              };
                              return p;
                          }, {})
                      })
                      .entries(self.data);

                self.xtabcolumns = d3.nest()
                      .key(function (d) { return d.C; })
                      .sortKeys(d3.ascending)
                      .entries(self.data);

                self.xtabtotal = d3.nest()
                      .key(function (d) { return 'Total'; })
                      .rollup(function (d) {
                          return d.reduce(function (p, c) {
                              if (c.Num) {
                                  p[c.C] = (p[c.C] ? p[c.C] : 0) + c.Num; p.Total = (p.Total ? p.Total : 0) + c.Num;
                              };
                              return p;
                          }, {})
                      })
                      .entries(self.data);
                self.Ready = true;
            }
            self.isWaiting = false;

        });

        $scope.$on('SearchError', function (event, resultpack) {
            if (resultpack.entity == self.theFilter.entity) {
                // no point waiting around - this train aint comin'
                self.isWaiting = false;
            }
        });

        // finally, if this Filter has already been searched, tell it we want to search again
        if (this.theFilter.prepared) {
            this.theFilter.FindNow();
        }

    };
    angular
       .module('sw.common')
        .controller('ChartController', ['$scope', 'theFilter', 'Lookups',chartController])
})();