module Pineapples.Scatter {
  // utulities
  var fx = function (d) { return d.x; };
  var fy = function (d) { return d.y; };

  type rowcolDatum = {
    R: string,
    C: string,
    Num: number
  };
  /**
   *  RowColChart is a custom directive to display data returned from
   *  Pineapples row col data as a stacked bar chart
   */
  class RowColChart implements ng.IDirective {


    constructor() { // constructor gets list of dependencies too
      RowColChart.prototype.link = (scope, element, attrs) => {
        // watchers - data, colorBy, colorByValue
        scope.$watch('data', (newValue) => {
          if (newValue) {
            this._drawChart(scope, element);
          }
        });
        scope.$watch('percentage', (newValue) => {
            this._drawChart(scope, element);
        });
        scope.$watch('orientation', (newValue) => {
          this._changeChartType(scope, element);
          this._drawChart(scope, element);
        });
        scope.$watch('stack', (newValue) => {
          this._changeChartType(scope, element);
          this._drawChart(scope, element);
        });

        scope.$watch('flip', (newValue) => {
          this._drawChart(scope, element);
        });

      };
    }
    public template: any = '<svg class="rowcol" height={{height}} width={{width}}></svg>';
    public restrict = "EA";
    public scope = {
      height: '@',
      width: '@',
      data: "=dataset",
      info: "=info",
      percentage: "@",
      orientation: "@",
      stack: "@",
      flip: "@"

    };

    public link: any;

    private _set: boolean = false;

    private _changeChartType(scope, element) {
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
    }
    /**
     * set up the plottable chart
     * @param scope
     * @param element
     * @returns {}
     */
    private _makeChart(scope, element) {
      scope.counter = 0;
      // ------ datasets -----------------
      // set up the required datasets and add them to scope
      scope.chartds = <Plottable.Dataset[]>[];


      /**
       * scales, axes, axislabels
       */
      let categoryScale = scope.categoryScale = new Plottable.Scales.Category();
      let valueScale = new Plottable.Scales.Linear();

      scope.categoryAxisV = new Plottable.Axes.Category(categoryScale, "bottom");
      scope.valueAxisV = new Plottable.Axes.Numeric(valueScale, "left");

      let categoryAxisH = new Plottable.Axes.Category(categoryScale, "left");
      let valueAxisH = new Plottable.Axes.Numeric(valueScale, "top");

      // persist these on scope so we can get to the text property
      scope.categoryAxisLabel = new Plottable.Components.AxisLabel("Enrolment 2007")
        .padding(1);
      scope.valueAxisLabel = new Plottable.Components.AxisLabel("Enrolment 2008", -90)
        .padding(5);

      let colorScale = new Plottable.Scales.Color();

      /**
       * Plots
       */

      //---------------- StackedBar ---------------------

      // first set up the animator
      // set up the animator

      let callbackAnimate = function (jr: Plottable.Drawers.JoinResult, attr, drawer) {
        jr.enter
          .on("click", function (d) {
          console.log(d.R);
          });
      this.innerAnimate(jr, attr, drawer);
    };
      var innerAnimator = new Plottable.Animators.Easing()
        //.exitEasingMode(Plottable.Animators.EasingFunctions.squEase("linear", 0, .5))
        //.easingMode(<any>Plottable.Animators.EasingFunctions.squEase("linear", .5, 1))
        .stepDuration(500)
        .stepDelay(0);
      let animator = new Plottable.Animators.Callback()
        .callback(callbackAnimate)
        .innerAnimator(innerAnimator);


      //// this is the main s plot
      scope.stackedBarV = new Plottable.Plots.StackedBar(Plottable.Plots.Bar.ORIENTATION_VERTICAL)
        .x((d) => d.R, categoryScale)
        .y((d) => d.Num, valueScale)
        .attr("fill", (d) => d.C, colorScale)
        .attr("opacity", .8)
        .animated(true)
        .animator(Plottable.Plots.Animator.MAIN, animator);

      //// this is the main s plot
      scope.clusteredBarV = new Plottable.Plots.ClusteredBar(Plottable.Plots.Bar.ORIENTATION_VERTICAL)
        .x((d) => d.R, categoryScale)
        .y((d) => d.Num, valueScale)
        .attr("fill", (d) => d.C, colorScale)
        .attr("opacity", .8)
        .animated(true)
        .animator(Plottable.Plots.Animator.MAIN, animator);

      scope.stackedBarH = new Plottable.Plots.StackedBar(Plottable.Plots.Bar.ORIENTATION_HORIZONTAL)
        .y((d) => d.R, categoryScale)
        .x((d) => d.Num, valueScale)
        .attr("fill", (d) => d.C, colorScale)
        .attr("opacity", .8)
        .animated(true)
        .animator(Plottable.Plots.Animator.MAIN, animator);

      scope.clusteredBarH = new Plottable.Plots.ClusteredBar(Plottable.Plots.Bar.ORIENTATION_HORIZONTAL)
        .y((d) => d.R, categoryScale)
        .x((d) => d.Num, valueScale)
        .attr("fill", (d) => d.C, colorScale)
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
    }

    private _drawChart(scope, element) {
      // check there is something to do
      if (!scope.data) {
        return;
      }
      if (!this._set) {
        this._makeChart(scope, element);
      };

      /**
       * Set up required datasets
       */
      var rawData = scope.data.ResultSet;
      // ths data needs to be transformed into a colection of datasets
      // first transform the data into a nest
      // each entry will become a Dataset and therefore a series
      // key will be the series identified, values is the series data
      // support flipping the R C
      let R = scope.flip === "on" ? "C" : "R";
      let C = scope.flip === "on" ? "R" : "C";

      var nestedData: any[] = d3.nest()
        .key((d:rowcolDatum) => d[C])
        .entries(rawData);
      // now nest along the R axis, to calculate the totals over all values for each R

      var nestedR: any[] = d3.nest()
        .key((d: rowcolDatum) => d[R])
        .rollup((leaves: rowcolDatum[]) => d3.sum(leaves, (d) => d.Num))
        .entries(rawData);

      let currentds = scope.currentBar.datasets();
      // first step through all the exisitng datasets and find the ones we can kill
      currentds.forEach((cds) => {
        //is there an incoming series matching this dataset?
        if (!_.find(nestedData, { key: cds.metadata().seriesID })) {
          // no, there isn't so if this dataset is empty, kill it, otherwise set it to empty data so it 
          // can exit gracefully
          if (cds.data().length) {
            scope.currentBar
              .removeDataset(cds);
            //cds.data([]);
          } else {
            scope.currentBar
              .removeDataset(cds);
          }
        }
      });
      // refresh this
      currentds = scope.currentBar.datasets();
      nestedData.forEach((nd) => {
        let newdata = nd.values.map((x) => {
          let tot: number = scope.percentage === "percentage" ? _.find(nestedR, { key: x[R] }).values : 100;
          return { R: x[R], C: x[C], Num: (x.Num * 100 / tot) };
        });
        let ds: Plottable.Dataset = _.find(currentds, (cds: Plottable.Dataset) => { return (cds.metadata().seriesID === nd.key) });
        if (ds) {
        // a dataset exists for this series
          ds.data(newdata);
        } else {
          ds = new Plottable.Dataset(newdata, { seriesID: nd.key })
            .keyFunction((x) => x.C + "|" + x.R);
          scope.currentBar
            .addDataset(ds);
        };
      });

      // axis labels
      scope.categoryAxisLabel.text('Foo bar');
      scope.valueAxisLabel.text('bar foo 2008');

    }
    // directive always get the factory - some plumbing
    public static Factory() {
      var directive = () => {
        ///*list of dependencies*/
        return new RowColChart(); //(/*list of dependencies*/);
      };

      //directive['$inject'] = ['/*list of dependencies*/'];

      return directive;
    }
  }

  angular
    .module("pineapples")
    .directive("rowColChart", RowColChart.Factory());
}