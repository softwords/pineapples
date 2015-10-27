
(function () {
           
    function bubbleCtrlr($http, $scope,filter ) {
                
        var _srcData;
        var self = this;

       

        self.theFilter = filter;
        //self.theData;

        $scope.$on('SearchComplete', function (event, resultpack) {
            if (resultpack.entity == self.theFilter.entity) {
                self.resultset = resultpack.resultset;
                // 3 recordsets come back - first is the scatter data

                self.theData = d3.nest()
                                    .key(function (d) { return d.District; })
                                    .entries(self.resultset[0]);

            }
        });

       $scope.$on('FindNow', function (event, data) {
            if (data.filter.entity == self.theFilter.entity) {
                //data.filter.SetColumnSet(self.selectedVM.columnSet == 'undefined' ?self.defaultColumnSet: self.selectedVM.columnSet);
                data.filter.requestSearch();
                self.isWaiting = true;
            }

        });        
                
 
        this.getData = function () {
            self.theFilter.FindNow();
        };

        var _baseYear;
        Object.defineProperty(this, 'baseYear', {
            get: function () { return _baseYear; },
            set: function (newValue) {
                _baseYear = newValue;
                if (_baseYear == 0)
                    self.sourceData = {};
                else
                    self.getData();

            }
        });

        this.selectedPoint = {};

        this.xfunc = function () {
            return function (d) {
                return d.XValue;
            };
        };
        this.yfunc = function () {
            return function (d) {
                return d.YValue;
            };
        };
        this.size = function () {
            return function (d,i) {
                return 1;
            };
        };
        this.shape = function () {
            return function (d, i) {
                switch (d.schType)
                {
                    case "PS":
                        return "circle";
                    case "JS":
                        return "square";
                    case "SS":
                        return "cross";
                    case "CS":

                        return "triangle-up";
                }
                return "triangle-down";
            };
        };
        this.zscale = function () {
            return d3.scale.linear();
        }
        this.toolTipContent = function () {
            return function (key, x, y, e, graph) {
                var p = e.point;
                return '<div><h3>' + p.schNo + '</h3>' +
                    '<p>' + y + ' at ' + x + '</p></div>'
            }
        };
        this.pointKey = function () {
            return function (d) {
                return d.schNo;
            }
        }

        this.colorBy = 'District';


        this.drawBelow = function() {
            return function (drw, bbox) {
                //drw.append('rect')
                //      .attr('height', bbox.height)
                //      .attr('width', bbox.width)
                //      .attr('style', 'fill:sky-blue; fill-opacity:.05');

                drw.append('line')
                    .attr('y2', 150)
                    .attr('x2', 60)
                    .attr('x1', 20)
                    .attr('y1', 30)
                    .attr('style', "stroke-opacity:1; stroke-width:30px; stroke:red");

                drw.append('path')
                    .attr('d', 'M0,0 H800V90L0,0')
                    .attr('style', "fill-opacity:.2; fill:pink; stroke-width:0; stroke:none");
            };
        };

        this.callback = function () {
            return function (chart) {
                console.log("in the callback!", chart.container);
                chart.scatter.dispatch.on("elementClick", function (e) {
                    self.selectedPoint = e.point;
                    $scope.$apply();
                });

            };
        };
        this.theFilter.params.BaseYear = 2011;
    };
    angular
        .module('pineapples')
        .controller('SchoolScatterController', ['$http','$scope','SchoolScatterFilter',bubbleCtrlr]);

})();
