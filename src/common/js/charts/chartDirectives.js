; (function () {
    // simple bar chart directive that highlights on datum
    // args - 
    // data - a data array
    // keyField - the property in the data that represents the key
    // hiliteValue - key value for the highlighted point
    // yField - property for the y value
    // yLabel - label for the y values
    // hiliteClass - class for the hilite bar

    //-----directive link
    var link = function (scope, element, attrs) {

        scope.$watch('data', function (newValue, oldValue) {
            if (newValue) {

                drawChart(scope, element);
            }

        }, true);
        scope.$watch('hiliteClass', function (newValue, oldValue) {
            if (newValue) {

                drawChart(scope, element);
            }

        }, true);
        scope.$watch('hiliteValue', function (newValue, oldValue) {
            if (newValue) {

                drawChart(scope, element);
            }

        }, true);
    };

    var directive = {
        scope: {
            height: '@',
            width: '@',
            data: "=dataset",
            // keyField - the property in the data that represents the key
            // hiliteValue - key value for the highlighted point
            // yField - property for the y value
            // yLabel - label for the y values
            // hiliteClass - class for the hilite bar
            keyField: '@',
            yField: '@',
            yLabel: '@',
            hiliteValue: '@',
            hiliteClass: '@'           // field to format the hilited point

        },
        link: link,
        restrict: 'EA',
        template: '<svg class="hiliteChart" height={{height}} width={{width}}></svg>'
                    
    }
    // function to establish the chart objects and render
    var makeChart = function (scope, element) {
        // use plottable to make the chart
        // very clean - no axes?


            scope.counter = 0;
            // ------ datasets -----------------

            scope.ds = new Plottable.Dataset()
              .key(function (d,i) { return d[scope.keyField]; });

            
            // ------ scales, axes, axislabels
            var xScale = scope.xScale = new Plottable.Scales.Linear();
            var yScale = scope.yScale = new Plottable.Scales.Linear();

            //var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
            //var yAxis = new Plottable.Axes.Numeric(yScale, "left");

            // persist these on scope so we can get to the text property
            //scope.xAxisLabel = new Plottable.Components.AxisLabel("Enrolment 2007")
            //  .padding(1);
            scope.yAxisLabel = new Plottable.Components.AxisLabel("Enrolment 2008", -90)
                .padding(5);

        //-----------animators
            var barAnimator = new Plottable.Animators.Easing()
                             .stepDuration(3000)
                             .stepDelay(0);

            // the chart
            scope.cht = new Plottable.Plots.Bar()
                            .addDataset(scope.ds)
                            .x(function (d, i) { return i; }, xScale)
                            .y(function (d) { return d[scope.yField]; }, yScale)
                            //.classed(scope.hiliteClass, function(d) { return (d[scope.keyField] == scope.hiliteValue);})
                            .attr("opacity", function (d) {
                                return (d[scope.keyField] == scope.hiliteValue ? 1 : .5);
                            })

                            .attr("schNo", function (d) { return d.schNo; })
                            .attr("index", function (d, i) { return i; })
                            .addClass("hilitebar")

                            .attr("fill", function (d) {
                                    return (d[scope.keyField] == scope.hiliteValue ? 'red' : 'gray');
                             })
                            //.animator(barAnimator);
            ///----- finalise chart
            scope.chart = new Plottable.Components.Table([
                        [scope.cht]
            ]);

            //// Create
            var svg = $(element).find('svg.hiliteChart');
            var d3svg = d3.selectAll(svg.toArray());
            scope.chart.renderTo(d3svg);

    }

    function drawChart(scope, element) {
        if (!scope.chart) {
            makeChart(scope, element);
        }
        // set up the data
        scope.ds.data(_.sortBy(scope.data,scope.yField));
    };
    angular
        .module('sw.common')
        .directive('hiliteBarChart', function() { return directive;});
})();
