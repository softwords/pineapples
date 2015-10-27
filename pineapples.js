var Pineapples;
(function (Pineapples) {
    var Scatter;
    (function (Scatter) {
        // utulities
        var fx = function (d) { return d.x; };
        var fy = function (d) { return d.y; };
        var tsDirective = (function () {
            function tsDirective() {
                var _this = this;
                this.template = '<svg class="schoolScatter" height={{height}} width={{width}}></svg>';
                this.restrict = "EA";
                this.scope = {
                    height: '@',
                    width: '@',
                    data: "=dataset",
                    info: "=info",
                    colorBy: '@',
                    colorByValue: '@' // if specified, ponts with this value in
                };
                tsDirective.prototype.link = function (scope, element, attrs) {
                    // watchers - data, colorBy, colorByValue
                    scope.$watch('data', function (newValue) {
                        if (newValue) {
                            _this._drawChart(scope, element);
                        }
                    }, true);
                    scope.$watch('colorBy', function (newValue) {
                        if (newValue) {
                            _this._drawChart(scope, element);
                        }
                    }, true);
                    scope.$watch('colorByValue', function (newValue) {
                        _this._drawChart(scope, element);
                    }, true);
                };
            }
            /**
             * set up the plottable chart
             * @param scope
             * @param element
             * @returns {}
             */
            tsDirective.prototype._makeChart = function (scope, element) {
                scope.counter = 0;
                // ------ datasets -----------------
                scope.scatterds = new Plottable.Dataset()
                    .keyFunction(Plottable.KeyFunctions.useProperty("schNo"));
                // centre line
                scope.midlineds = new Plottable.Dataset();
                // areas
                scope.a0ds = new Plottable.Dataset().metadata('0');
                scope.a1ds = new Plottable.Dataset().metadata('1');
                scope.a2ds = new Plottable.Dataset().metadata('2');
                scope.a3ds = new Plottable.Dataset().metadata('3');
                scope.a4ds = new Plottable.Dataset().metadata('4');
                // x-axis decorations
                scope.xextentds = new Plottable.Dataset(); // line covering extent of x values
                scope.xminds = new Plottable.Dataset(); // min x "tick mark"
                scope.xmaxds = new Plottable.Dataset(); // max x "tick mark"
                scope.xmidds = new Plottable.Dataset(); // mid x "tick mark"
                scope.xq1ds = new Plottable.Dataset(); // q1 x "tick mark"
                scope.xq3ds = new Plottable.Dataset(); // q3 x "tick mark"
                // y axis decorations
                scope.yextentds = new Plottable.Dataset();
                scope.yminds = new Plottable.Dataset();
                scope.ymaxds = new Plottable.Dataset();
                scope.ymidds = new Plottable.Dataset();
                scope.yq1ds = new Plottable.Dataset(); // q1 y "tick mark"
                scope.yq3ds = new Plottable.Dataset(); // q3 y "tick mark"
                /**
                 * scales, axes, axislabels
                 */
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
                var symbolScale = d3.scale.ordinal()
                    .range([
                    Plottable.SymbolFactories.circle(),
                    Plottable.SymbolFactories.cross(),
                    Plottable.SymbolFactories.square(),
                    Plottable.SymbolFactories.triangleUp(),
                    Plottable.SymbolFactories.triangleDown(),
                    Plottable.SymbolFactories.diamond()
                ]);
                /**
                 * Interactions
                 */
                scope.panZoom = new Plottable.Interactions.PanZoom(xScale, yScale);
                scope.tooltipper = new Plottable.Interactions.Pointer();
                /**
                 * Plots
                 */
                //---------------- Scatter ---------------------
                // this is the main scatter plot
                var colorFactory = function (d) {
                    if (scope.colorByValue) {
                        return (d[scope.colorBy] === scope.colorByValue ? "red" : "gray");
                    }
                    return d[scope.colorBy];
                };
                scope.scatter = new Plottable.Plots.Scatter()
                    .symbol((function (d) { return symbolScale(d.schType); }))
                    .size(16)
                    .x(function (d) { return d.XValue; }, xScale)
                    .y(function (d) { return d.YValue; }, yScale)
                    .addDataset(scope.scatterds)
                    .attr("fill", colorFactory, colorScale)
                    .attr("opacity", .8)
                    .attr("popover", function (d) { return '<div><h4>' + d.schName + '</h4><p>' + d.YValue + '</p></div>'; });
                //.attr("popover-placement", "top")
                //.attr("popover-append-to-body", "true")
                //.attr("popover-animation", "true")
                //.attr("popover-trigger", "mouseenter")
                // set up the animator
                var startAttrs = { opacity: function () { return 0; }, fill: function () { return "pink"; } };
                startAttrs = {
                    d: function (d) {
                        var symbol = symbolScale(d.schType);
                        return symbol(0);
                    }
                };
                var scatterAnimator = new Plottable.Animators.Attr()
                    .startAttrs(startAttrs)
                    .endAttrs(startAttrs)
                    .exitEasingMode(Plottable.Animators.EasingFunctions.squEase("linear", 0, .5))
                    .easingMode(Plottable.Animators.EasingFunctions.squEase("linear", .5, 1))
                    .stepDuration(500)
                    .stepDelay(0);
                scope.scatter
                    .animated(true)
                    .animator(Plottable.Plots.Animator.MAIN, scatterAnimator);
                //scope.bar = new Plottable.Plots.Bar()
                //  .addDataset(scope.scatterds)
                //  .x(function(d, i) { return i * 5 + 5; }, xScale)
                //  .y(function(d) { return d.YValue; }, yScale)
                //  .attr("width", 4)
                //  .attr("opacity", 1)
                //  .attr('fill', 'blue')
                //  .animated(true)
                //  .animator(Plottable.Plots.Animator.MAIN, scatterAnimator);
                // supporting grid
                var grid = new Plottable.Components.Gridlines(xScale, yScale);
                //------------- centre line
                // centre line on the scatter grid
                // depending on view , this plots the slope of YonXmedian or YonX average
                var midline = new Plottable.Plots.Line()
                    .x(fx, xScale)
                    .y(fy, yScale)
                    .addDataset(scope.midlineds)
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
                    return 0;
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
                var xmidl = new Plottable.Plots.Scatter()
                    .symbol(function (d, i) { return Plottable.SymbolFactories.triangleUp(); })
                    .size(20)
                    .x(fx, xScale)
                    .y(fy, nullScale)
                    .addDataset(scope.xmidds);
                // y axis decoration
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
                    .symbol(function (d, i) { return Plottable.SymbolFactories.triangleUp(); })
                    .size(20)
                    .x(fx, ydecoScale).y(fy, yScale);
                // groups
                var mergedPlots = new Plottable.Components.Group([grid, area, midline, scope.scatter]);
                var grpx = new Plottable.Components.Group([xextentl, xminl, xmaxl, xmidl, xq1l, xq3l, xAxis]);
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
                    .minDomainExtent(xScale, 0);
                /**
                 * Legends
                 */
                // colorLegend legend
                // based on the color-by attribute
                var colorLegend = new Plottable.Components.Legend(colorScale);
                colorLegend
                    .maxEntriesPerRow(1)
                    .xAlignment('left');
                // school type legend
                scope.typeScale = new Plottable.Scales.Color();
                scope.typeScale.scale = function (d) { return "#202020"; };
                var typeLegend = new Plottable.Components.Legend(scope.typeScale);
                typeLegend
                    .symbol((function (d) { return symbolScale(d); }))
                    .maxEntriesPerRow(1)
                    .xAlignment('left');
                var legends = new Plottable.Components.Table([
                    [typeLegend],
                    [colorLegend]
                ]);
                scope.chart = new Plottable.Components.Table([
                    //[yAxis, plot],
                    [grpy, mergedPlots, legends],
                    // [null, scope.bar, null],
                    //[yAxis3, mergedPlots],
                    [null, grpx, null] //,
                ])
                    .rowWeight(1, .1)
                    .columnWeight(0, .05);
                var svg = $(element).find("svg.schoolScatter");
                var d3svg = d3.selectAll(svg.toArray());
                scope.chart.renderTo(d3svg);
            };
            tsDirective.prototype._drawChart = function (scope, element) {
                if (!scope.chart) {
                    this._makeChart(scope, element);
                }
                ;
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
                // type legend
                scope.typeScale.domain(_(scope.data[0]).pluck("schType").unique().value());
                var svg = $(element).find('svg.xychart');
            };
            // directive always get the factory - some plumbing
            tsDirective.Factory = function () {
                var directive = function () {
                    ///*list of dependencies*/
                    return new tsDirective(); //(/*list of dependencies*/);
                };
                //directive['$inject'] = ['/*list of dependencies*/'];
                return directive;
            };
            return tsDirective;
        })();
        angular
            .module("pineapples")
            .directive("tsDirective", tsDirective.Factory());
    })(Scatter = Pineapples.Scatter || (Pineapples.Scatter = {}));
})(Pineapples || (Pineapples = {}));
var Pineapples;
(function (Pineapples) {
    var Scatter;
    (function (Scatter) {
        // utulities
        var fx = function (d) { return d.x; };
        var fy = function (d) { return d.y; };
        /**
         *  RowColChart is a custom directive to display data returned from
         *  Pineapples row col data as a stacked bar chart
         */
        var RowColChart = (function () {
            function RowColChart() {
                var _this = this;
                this.template = '<svg class="rowcol" height={{height}} width={{width}}></svg>';
                this.restrict = "EA";
                this.scope = {
                    height: '@',
                    width: '@',
                    data: "=dataset",
                    info: "=info",
                    percentage: "@",
                    orientation: "@",
                    stack: "@",
                    flip: "@"
                };
                this._set = false;
                RowColChart.prototype.link = function (scope, element, attrs) {
                    // watchers - data, colorBy, colorByValue
                    scope.$watch('data', function (newValue) {
                        if (newValue) {
                            _this._drawChart(scope, element);
                        }
                    });
                    scope.$watch('percentage', function (newValue) {
                        _this._drawChart(scope, element);
                    });
                    scope.$watch('orientation', function (newValue) {
                        _this._changeChartType(scope, element);
                        _this._drawChart(scope, element);
                    });
                    scope.$watch('stack', function (newValue) {
                        _this._changeChartType(scope, element);
                        _this._drawChart(scope, element);
                    });
                    scope.$watch('flip', function (newValue) {
                        _this._drawChart(scope, element);
                    });
                };
            }
            RowColChart.prototype._changeChartType = function (scope, element) {
                var svg = $(element).find("svg.rowcol");
                var d3svg = d3.selectAll(svg.toArray());
                scope.currentBar.datasets([]);
                if (scope.chart) {
                    scope.chart.destroy();
                    scope.chart = undefined;
                }
                switch (scope.orientation) {
                    case Plottable.Plots.Bar.ORIENTATION_VERTICAL:
                        switch (scope.stack) {
                            case "stack":
                                scope.currentBar = scope.stackedBarV;
                                break;
                            case "cluster":
                                scope.currentBar = scope.clusteredBarV;
                                break;
                        }
                        scope.chart = new Plottable.Components.Table([
                            [scope.valueAxisV, scope.currentBar, scope.legendV],
                            [null, scope.categoryAxisV, null]
                        ]);
                        scope.chart.renderTo(d3svg);
                        break;
                    case Plottable.Plots.Bar.ORIENTATION_HORIZONTAL:
                        switch (scope.stack) {
                            case "stack":
                                scope.currentBar = scope.stackedBarH;
                                scope.chartH.renderTo(d3svg);
                                break;
                            case "cluster":
                                scope.currentBar = scope.clusteredBarH;
                                scope.chartHC.renderTo(d3svg);
                                break;
                        }
                        break;
                }
            };
            /**
             * set up the plottable chart
             * @param scope
             * @param element
             * @returns {}
             */
            RowColChart.prototype._makeChart = function (scope, element) {
                scope.counter = 0;
                // ------ datasets -----------------
                // set up the required datasets and add them to scope
                scope.chartds = [];
                /**
                 * scales, axes, axislabels
                 */
                var categoryScale = scope.categoryScale = new Plottable.Scales.Category();
                var valueScale = new Plottable.Scales.Linear();
                scope.categoryAxisV = new Plottable.Axes.Category(categoryScale, "bottom");
                scope.valueAxisV = new Plottable.Axes.Numeric(valueScale, "left");
                var categoryAxisH = new Plottable.Axes.Category(categoryScale, "left");
                var valueAxisH = new Plottable.Axes.Numeric(valueScale, "top");
                // persist these on scope so we can get to the text property
                scope.categoryAxisLabel = new Plottable.Components.AxisLabel("Enrolment 2007")
                    .padding(1);
                scope.valueAxisLabel = new Plottable.Components.AxisLabel("Enrolment 2008", -90)
                    .padding(5);
                var colorScale = new Plottable.Scales.Color();
                /**
                 * Plots
                 */
                //---------------- StackedBar ---------------------
                // first set up the animator
                // set up the animator
                var callbackAnimate = function (jr, attr, drawer) {
                    jr.enter
                        .on("click", function (d) {
                        console.log(d.R);
                    });
                    this.innerAnimate(jr, attr, drawer);
                };
                var innerAnimator = new Plottable.Animators.Easing()
                    .stepDuration(500)
                    .stepDelay(0);
                var animator = new Plottable.Animators.Callback()
                    .callback(callbackAnimate)
                    .innerAnimator(innerAnimator);
                //// this is the main s plot
                scope.stackedBarV = new Plottable.Plots.StackedBar(Plottable.Plots.Bar.ORIENTATION_VERTICAL)
                    .x(function (d) { return d.R; }, categoryScale)
                    .y(function (d) { return d.Num; }, valueScale)
                    .attr("fill", function (d) { return d.C; }, colorScale)
                    .attr("opacity", .8)
                    .animated(true)
                    .animator(Plottable.Plots.Animator.MAIN, animator);
                //// this is the main s plot
                scope.clusteredBarV = new Plottable.Plots.ClusteredBar(Plottable.Plots.Bar.ORIENTATION_VERTICAL)
                    .x(function (d) { return d.R; }, categoryScale)
                    .y(function (d) { return d.Num; }, valueScale)
                    .attr("fill", function (d) { return d.C; }, colorScale)
                    .attr("opacity", .8)
                    .animated(true)
                    .animator(Plottable.Plots.Animator.MAIN, animator);
                scope.stackedBarH = new Plottable.Plots.StackedBar(Plottable.Plots.Bar.ORIENTATION_HORIZONTAL)
                    .y(function (d) { return d.R; }, categoryScale)
                    .x(function (d) { return d.Num; }, valueScale)
                    .attr("fill", function (d) { return d.C; }, colorScale)
                    .attr("opacity", .8)
                    .animated(true)
                    .animator(Plottable.Plots.Animator.MAIN, animator);
                scope.clusteredBarH = new Plottable.Plots.ClusteredBar(Plottable.Plots.Bar.ORIENTATION_HORIZONTAL)
                    .y(function (d) { return d.R; }, categoryScale)
                    .x(function (d) { return d.Num; }, valueScale)
                    .attr("fill", function (d) { return d.C; }, colorScale)
                    .attr("opacity", .8)
                    .animated(true)
                    .animator(Plottable.Plots.Animator.MAIN, animator);
                scope.currentBar = scope.stackedBarV;
                /**
                * Legend
                */
                // colorLegend legend
                scope.legendV = new Plottable.Components.Legend(colorScale)
                    .maxEntriesPerRow(1)
                    .xAlignment('left');
                var legendH = new Plottable.Components.Legend(colorScale)
                    .maxEntriesPerRow(1)
                    .xAlignment('left');
                // Vertical and horizontal forms of the chart
                scope.chartH = new Plottable.Components.Table([
                    [null, valueAxisH, null],
                    [categoryAxisH, scope.stackedBarH, legendH]
                ]);
                scope.chartHC = new Plottable.Components.Table([
                    [null, valueAxisH, null],
                    [categoryAxisH, scope.clusteredBarH, legendH]
                ]);
                this._changeChartType(scope, element);
                this._set = true;
            };
            RowColChart.prototype._drawChart = function (scope, element) {
                // check there is something to do
                if (!scope.data) {
                    return;
                }
                if (!this._set) {
                    this._makeChart(scope, element);
                }
                ;
                /**
                 * Set up required datasets
                 */
                var rawData = scope.data.ResultSet;
                // ths data needs to be transformed into a colection of datasets
                // first transform the data into a nest
                // each entry will become a Dataset and therefore a series
                // key will be the series identified, values is the series data
                // support flipping the R C
                var R = scope.flip === "on" ? "C" : "R";
                var C = scope.flip === "on" ? "R" : "C";
                var nestedData = d3.nest()
                    .key(function (d) { return d[C]; })
                    .entries(rawData);
                // now nest along the R axis, to calculate the totals over all values for each R
                var nestedR = d3.nest()
                    .key(function (d) { return d[R]; })
                    .rollup(function (leaves) { return d3.sum(leaves, function (d) { return d.Num; }); })
                    .entries(rawData);
                var currentds = scope.currentBar.datasets();
                // first step through all the exisitng datasets and find the ones we can kill
                currentds.forEach(function (cds) {
                    //is there an incoming series matching this dataset?
                    if (!_.find(nestedData, { key: cds.metadata().seriesID })) {
                        // no, there isn't so if this dataset is empty, kill it, otherwise set it to empty data so it 
                        // can exit gracefully
                        if (cds.data().length) {
                            scope.currentBar
                                .removeDataset(cds);
                        }
                        else {
                            scope.currentBar
                                .removeDataset(cds);
                        }
                    }
                });
                // refresh this
                currentds = scope.currentBar.datasets();
                nestedData.forEach(function (nd) {
                    var newdata = nd.values.map(function (x) {
                        var tot = scope.percentage === "percentage" ? _.find(nestedR, { key: x[R] }).values : 100;
                        return { R: x[R], C: x[C], Num: (x.Num * 100 / tot) };
                    });
                    var ds = _.find(currentds, function (cds) { return (cds.metadata().seriesID === nd.key); });
                    if (ds) {
                        // a dataset exists for this series
                        ds.data(newdata);
                    }
                    else {
                        ds = new Plottable.Dataset(newdata, { seriesID: nd.key })
                            .keyFunction(function (x) { return x.C + "|" + x.R; });
                        scope.currentBar
                            .addDataset(ds);
                    }
                    ;
                });
                // axis labels
                scope.categoryAxisLabel.text('Foo bar');
                scope.valueAxisLabel.text('bar foo 2008');
            };
            // directive always get the factory - some plumbing
            RowColChart.Factory = function () {
                var directive = function () {
                    ///*list of dependencies*/
                    return new RowColChart(); //(/*list of dependencies*/);
                };
                //directive['$inject'] = ['/*list of dependencies*/'];
                return directive;
            };
            return RowColChart;
        })();
        angular
            .module("pineapples")
            .directive("rowColChart", RowColChart.Factory());
    })(Scatter = Pineapples.Scatter || (Pineapples.Scatter = {}));
})(Pineapples || (Pineapples = {}));
