/*
* Pineapples XY Chart
*
* built with plottable
*/

; (function () {
    
        //this.chart = null;

        //this.datasets = null;

        //this.scatterdata = null;
        //this.medianlinedata = null;

        //this.medianlinedata = []
        //// Step 1
        //// make the Table object to repesent the chart

        //// Step 2
        //// update 

        //if (!this.datasets)
        //{
        //    this.datasets = [];
        //    this.datasets.push(new Plottable.Dataset(scope.))
        //}
        var symbolFcn = function (d) {
            var v = (angular.isObject(d) ? d.schType : d);
            switch (v) {
                case "JS":
                    return Plottable.SymbolFactories.cross();
                case "P":
                    return Plottable.SymbolFactories.circle();
                case "SS":
                    return Plottable.SymbolFactories.square();
                case "CS":
                    return Plottable.SymbolFactories.triangleDown();

            }
            return Plottable.SymbolFactories.diamond();
        };
        // utulities
        var fx = function (d) { return d.x; };
        var fy = function (d) { return d.y; };

        //-----directive link function
        var link = function (scope, element, attrs) {

            // watchers - data, colorBy, colorByValue
            scope.$watch('data', function (newValue, oldValue) {
                if (newValue) {

                    drawChart(scope, element);
                }

            }, true);
            scope.$watch('colorBy', function (newValue, oldValue) {
                if (newValue) {

                    drawChart(scope, element);
                }

            }, true);
            scope.$watch('colorByValue', function (newValue, oldValue) {

                drawChart(scope, element);

            }, true);
        };


        var directive = {
            scope: {
                height: '@',
                width: '@',
                data: "=dataset",
                info: "=info",
                colorBy: '@',               // field to determine the color of points
                colorByValue: '@',         // if specified, ponts with this value in     

            },
            link: link,
            restrict: 'EA',
            template: '<svg class="schoolScatter" height={{height}} width={{width}}></svg>'

        }
        var makeChart = function (scope, element) {

            
                scope.counter = 0;
                // ------ datasets -----------------

                scope.scatterds = new Plottable.Dataset()
                  .key(function (d, i) { return scope.counter++; });


                // centre line
                scope.midlineds = new Plottable.Dataset();
                // areas
                scope.a0ds = new Plottable.Dataset().metadata('0');
                scope.a1ds = new Plottable.Dataset().metadata('1');
                scope.a2ds = new Plottable.Dataset().metadata('2');
                scope.a3ds = new Plottable.Dataset().metadata('3');
                scope.a4ds = new Plottable.Dataset().metadata('4');

                // x-axis decorations
                scope.xextentds = new Plottable.Dataset();  // line covering extent of x values
                scope.xminds = new Plottable.Dataset();     // min x "tick mark"
                scope.xmaxds = new Plottable.Dataset();     // max x "tick mark"
                scope.xmidds = new Plottable.Dataset();     // mid x "tick mark"
                scope.xq1ds = new Plottable.Dataset();     // q1 x "tick mark"
                scope.xq3ds = new Plottable.Dataset();     // q3 x "tick mark"

                // y axis decorations
                scope.yextentds = new Plottable.Dataset();
                scope.yminds = new Plottable.Dataset();
                scope.ymaxds = new Plottable.Dataset();
                scope.ymidds = new Plottable.Dataset();
                scope.yq1ds = new Plottable.Dataset();     // q1 y "tick mark"
                scope.yq3ds = new Plottable.Dataset();     // q3 y "tick mark"


                // ------ scales, axes, axislabels
                var xScale = scope.xScale = new Plottable.Scales.Linear();
                var yScale = scope.yScale = new Plottable.Scales.Linear();

                var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
                var yAxis = new Plottable.Axes.Numeric(yScale, "left");

                // persist these on scope so we can get to the text property
                scope.xAxisLabel = new Plottable.Components.AxisLabel("Enrolment 2007")
                    .padding(1);
                scope.yAxisLabel = new Plottable.Components.AxisLabel("Enrolment 2008", -90)
                    .padding(5);

                var colorScale = new Plottable.Scales.Color();
                var symbolScale = new d3.scale.ordinal()
                    .range([Plottable.SymbolFactories.circle(),
                            Plottable.SymbolFactories.cross(),
                            Plottable.SymbolFactories.square(),
                            Plottable.SymbolFactories.triangleUp(),
                            Plottable.SymbolFactories.triangleDown(),
                            Plottable.SymbolFactories.diamond()
                    ])


                // interactons
                // pan zoom 
                scope.panZoom = new Plottable.Interactions.PanZoom(xScale, yScale);
                scope.tooltipper = new Plottable.Interactions.Pointer(xScale, yScale);

                //------------ Plots


                //---------------- Scatter ---------------------
                // this is the main scatter plot
                var scatterAnimator = new Plottable.Animators.Easing()
                    .stepDuration(3000)
                    .stepDelay(0);

                ////////scope.tip = d3.tip()
                ////////      .attr('class', 'd3-tip')
                ////////      .offset([-10, 0])
                ////////      .html(function (d) {
                ////////          return "<strong>Frequency:</strong> <span style='color:red'>" + d.schName + "</span>";
                ////////      })
               var colorFactory = function (d) {
                    if (scope.colorByValue) {
                        return (d[scope.colorBy] == scope.colorByValue ? "red" : "gray");
                    }
                    return d[scope.colorBy];
                }
                scope.scatter = new Plottable.Plots.Scatter()
                    .addDataset(scope.scatterds)
                    .x(function (d) { return d.XValue; }, xScale)
                    .y(function (d) { return d.YValue; }, yScale)
                    //.symbol(symbolFcn)
                    .symbol(function (d) { return symbolScale(d.schType); })
                    .attr("fill", colorFactory, colorScale)
                    .size(function (d) { return 16; })
                    .attr("opacity", .8)
                    .attr("popover", function (d) { return '<div><h4>' + d.schName + '</h4><p>' + d.YValue + '</p></div>'; })
                    //.attr("popover-placement", "top")
                    //.attr("popover-append-to-body", "true")
                    //.attr("popover-animation", "true")
                    //.attr("popover-trigger", "mouseenter")

                    .animated(true)
                    .animator(Plottable.Plots.Animator.MAIN, scatterAnimator);

                scope.scatter.enter()
                    .x(function (d) { return 0; }, xScale)
                    .y(function (d) { return 0; }, yScale)
                    .size(4)
                    .attr("opacity", 0)
                    .attr('fill', 'pink');

                scope.scatter.exit()
                    .x(function (d) { return scope.stats.Xmax; }, xScale)
                    .y(function (d) { return scope.stats.Ymax; }, yScale)
                    .symbol(function (d) { return symbolScale(d.schType); })
                    .size(4)
                    .attr("opacity", 0)
                    .attr('fill', 'pink');

                scope.bar = new Plottable.Plots.Bar()
                    .addDataset(scope.scatterds)
                    .x(function (d, i) { return i * 5 + 5; }, xScale)
                    .y(function (d) { return d.YValue; }, yScale)
                    .attr("width", 4)
                    .attr("opacity", 1)
                    .attr('fill', 'blue')
                    .animated(true)
                    .animator(Plottable.Plots.Animator.MAIN, scatterAnimator);

                scope.bar.enter()
                    .x(function (d, i) { return 0; }, xScale)
                    .y(function (d) { return 0; }, yScale)
                    .attr("width", 4)
                    .attr("opacity", 0)
                    .attr('fill', 'pink');

                scope.bar.exit()
                    .x(function (d, i) { return 100; }, xScale)
                    .y(function (d) { return d.YValue; }, yScale)
                    .attr('fill', 'pink')
                    .animator((new Plottable.Animators.Easing()).stepDuration(3000), Plottable.Plots.Animator.MAIN)
                    .exit()
                        .animator((new Plottable.Animators.Easing()).stepDuration(3000), Plottable.Plots.Animator.MAIN)
                        .x(function (d, i) { return 200; }, xScale)
                        .y(function (d) { return 0; }, yScale)
                        .attr("width", 0)
                        .attr('fill', 'green')
                        .attr("opacity", 1);

                // supporting grid
                var grid = new Plottable.Components.Gridlines(xScale, yScale);

                //------------- centre line
                // centre line on the scatter grid
                // depending on view , this plots the slope of YonXmedian or YonX average
                var midline = new Plottable.Plots.Line()
                    .addDataset(scope.midlineds)
                    .x(fx, xScale)
                    .y(fy, yScale)
                    .attr("stroke", '#404040')
                    .attr("stroke-width", 2)
                    .attr("opacity", .2);

                // ------area ranges
                // one blank range and four coloured ranges
                var acolor = new Plottable.Scales.Color();

                var area = new Plottable.Plots.StackedArea()
                    .addDataset(scope.a0ds)
                    .addDataset(scope.a1ds)
                    .addDataset(scope.a2ds)
                    .addDataset(scope.a3ds)
                    .addDataset(scope.a4ds)
                    .x(fx, xScale)
                    .y(fy, yScale)
                    .attr("fill", '#5279c7')
                    .attr("stroke-width", 0)
                    .attr("opacity", function (d, i, dataset) {
                        switch (dataset.metadata()) {
                            case '0':
                                return 0;
                            case '1':
                            case '4':
                                return .05;
                            case '2':
                            case '3':
                                return .1;
                        }

                    });



                var nullScale = new Plottable.Scales.Linear()
                                        .domain([0, 10])
                                        .range([0, 10]);

                var styleLinePlot = function (plot) {
                    plot.x(fx, xScale).y(fy, nullScale)
                    .attr("stroke", "#dddd00").attr("stroke-width", 12);
                };



                var ydecoScale = new Plottable.Scales.Linear()
                                       .domain([0, 10])
                                       .range([0, -10]);

                var styleYdeco = function (plot) {
                    plot.x(fx, ydecoScale).y(fy, yScale)
                    .attr("stroke", "#dddd00").attr("stroke-width", 12);
                };

                var xextentl = new Plottable.Plots.Line();
                xextentl.addDataset(scope.xextentds);
                styleLinePlot(xextentl);


                var xminl = new Plottable.Plots.Line();
                xminl.addDataset(scope.xminds);
                styleLinePlot(xminl);

                var xmaxl = new Plottable.Plots.Line()
                    .addDataset(scope.xmaxds)
                    .attr("title", function () { return scope.xmaxds.data()[0].x; });
                styleLinePlot(xmaxl);

                var xq1l = new Plottable.Plots.Line();
                xmaxl.addDataset(scope.xq1ds);
                styleLinePlot(xq1l);

                var xq3l = new Plottable.Plots.Line();
                xmaxl.addDataset(scope.xq3ds);
                styleLinePlot(xq3l);


                var xmidl = new Plottable.Plots.Scatter();
                xmidl.addDataset(scope.xmidds);
                xmidl
                    .x(fx, xScale).y(fy, nullScale)
                    .symbol(function (d, i) { return Plottable.SymbolFactories.triangleUp(); })
                    .size(20);




                // y axis decoaration
                var yextentl = new Plottable.Plots.Line()
                    .addDataset(scope.yextentds);
                styleYdeco(yextentl);

                var yminl = new Plottable.Plots.Line()
                    .addDataset(scope.yminds);
                styleYdeco(yminl);

                var ymaxl = new Plottable.Plots.Line()
                    .addDataset(scope.ymaxds);
                styleYdeco(ymaxl);

                var yq1l = new Plottable.Plots.Line()
                    .addDataset(scope.yq1ds);
                styleYdeco(yq1l);

                var yq3l = new Plottable.Plots.Line()
                    .addDataset(scope.yq3ds);
                styleYdeco(yq3l);


                var ymidpt = new Plottable.Plots.Scatter();
                ymidpt.addDataset(scope.ymidds);
                ymidpt
                    .x(fx, ydecoScale).y(fy, yScale)
                    .symbol(function (d, i) { return Plottable.SymbolFactories.triangleUp(); })
                    .size(20);

                // groups
                var mergedPlots = new Plottable.Components.Group([grid, area, midline, scope.scatter]);

                var grpx = new Plottable.Components.Group([xextentl, xminl, xmaxl, xmidl, xq1l, xq3l, xAxis])
                grpx = new Plottable.Components.Table([
                                                            [grpx],
                                                            [scope.xAxisLabel]
                ])
                .rowWeight(1, .1);
                var grpy = new Plottable.Components.Group([yextentl, yminl, ymaxl, ymidpt, yq1l, yq3l, yAxis, scope.yAxisLabel]);

                //var interaction = new Plottable.Interactions.Click();
                //interaction.onClick(function (point) {
                //    bar2.selections().attr("fill", "#5279c7");
                //    var selection = bar2.entitiesAt(point)[0].selection;
                //    selection.attr("fill", "#F99D42");
                //});
                //interaction.attachTo(bar2);


                scope.panZoom
                    .attachTo(mergedPlots)
                    .minDomainExtent(xScale, 0)

                //------------------------- Legends ---------------------------------

                // colorLegend legend
                // based on the color-by atrtibute
                var colorLegend = new Plottable.Components.Legend(colorScale);
                colorLegend
                    .xAlignment('left')
                    .maxEntriesPerRow(1);

                // school type legend
                var typeScale = new Plottable.Scales.Color();
                typeScale.scale = function (d) { return "#20F020"; }
                typeScale.domain(['JS', 'P', 'SS', 'CS']);
                var typeLegend = new Plottable.Components.Legend(typeScale);
                typeLegend
                    .xAlignment('left')

                    .maxEntriesPerRow(1);

                var legends = new Plottable.Components.Table([
                      [typeLegend],
                      [colorLegend]
                ]);

                scope.chart = new Plottable.Components.Table([
                  //[yAxis, plot],

                 [grpy, mergedPlots, legends],
                 // [null, scope.bar, null],
                  //[yAxis3, mergedPlots],
                  [null, grpx, null]//,
                 // [null, bar2],
                 // [null, schAxis]

                  //[null,typeLegend]
                ])
                    .rowWeight(1, .1)
                    .columnWeight(0, .05);


                var svg = $(element).find('svg.schoolScatter');
                var d3svg = d3.selectAll(svg.toArray());
                scope.chart.renderTo(d3svg);

     }
        var drawChart = function(scope, element) {
            if (!scope.chart) {
                makeChart(scope, element);
            };

            // set up the data
            var scatterdata = scope.data[0];
            // first and only row of the stats resultset
            var stats = scope.stats = scope.data[1][0];
           
            // x axie decoration
            var midlinedata = [{ x: 0, y: 0 }, { x: stats.Xmax, y: stats.YonXmedian * stats.Xmax }];

            var xextentdata = [{ x: stats.Xmin, y: 10 }, { x: stats.Xmax, y: 10 }];
            var xmindata = [{ x: stats.Xmin, y: 10 }, { x: stats.Xmin, y: 7 }];

            var xmaxdata = [{ x: stats.Xmax, y: 10 }, { x: stats.Xmax, y: 7 }];
            var xmiddata = [{ x: stats.Xmedian, y: 7 }];

            var xq1data = [{ x: stats.XQ1, y: 10 }, { x: stats.XQ1, y: 7 }];
            var xq3data = [{ x: 10, y: stats.XQ3 }, { x: 9, y: stats.XQ3 }];

            // y axis decoration
            var yextentdata = [{ x: 10, y: stats.Ymin }, { x: 10, y: stats.Ymax }];
            var ymindata = [{ x: 10, y: stats.Ymin }, { x: 9, y: stats.Ymin }];

            var ymaxdata = [{ x: 10, y: stats.Ymax }, { x: 9, y: stats.Ymax }];
            var ymiddata = [{ x: 8, y: stats.Ymedian }];

            var yq1data = [{ x: 10, y: stats.YQ1 }, { x: 9, y: stats.YQ1 }];
            var yq3data = [{ x: 10, y: stats.YQ3 }, { x: 9, y: stats.YQ3 }];

            var intConfidence = 1.5;
            // area shading
            var cFactor = intConfidence * (stats.YonXQ3 - stats.YonXQ1);
            var a0data = [{ x: 0, y: 0 }, { x: stats.Xmax, y: stats.Xmax * (stats.YonXQ1 - cFactor) }];
            var a1data = [{ x: 0, y: 0 }, { x: stats.Xmax, y: stats.Xmax * (cFactor) }];
            var a2data = [{ x: 0, y: 0 }, { x: stats.Xmax, y: stats.Xmax * (stats.YonXmedian - stats.YonXQ1) }];

            var a3data = [{ x: 0, y: 0 }, { x: stats.Xmax, y: stats.Xmax * (stats.YonXQ3 - stats.YonXmedian) }];
            var a4data = [{ x: 0, y: 0 }, { x: stats.Xmax, y: stats.Xmax * (cFactor) }];

            scope.xScale
                .domain([0, stats.Xmax + 30]);

            scope.yScale
                .domainMin(0)
                .domainMax(stats.Ymax + 30);

            scope.panZoom
                .maxDomainExtent(scope.xScale, stats.Xmax + 30);

            scope.scatterds.data(scatterdata);
            scope.midlineds.data(midlinedata);

            scope.xextentds.data(xextentdata);
            scope.xminds.data(xmindata);
            scope.xmaxds.data(xmaxdata);
            scope.xmidds.data(xmiddata);
            scope.xq1ds.data(xq1data);
            scope.xq3ds.data(xq3data);

            scope.yextentds.data(yextentdata);
            scope.yminds.data(ymindata);
            scope.ymaxds.data(ymaxdata);
            scope.ymidds.data(ymiddata);
            scope.yq1ds.data(yq1data);
            scope.yq3ds.data(yq3data);

            scope.a0ds.data(a0data);
            scope.a1ds.data(a1data);
            scope.a2ds.data(a2data);
            scope.a3ds.data(a3data);
            scope.a4ds.data(a4data);

            // axis labels
            scope.xAxisLabel.text('Foo bar');
            scope.yAxisLabel.text('bar foo 2008');

            var svg = $(element).find('svg.xychart');
            $compile(svg)(scope);

        };


   var schoolScatter = function ($compile) {
        return directive;
    }

    angular
        .module("pineapples")
        .directive("schoolScatter", ['$compile', schoolScatter])
})();