angular.module('sw.directives', []);


(function () {
    var fitcontent = function ($window, $timeout, $location) {
        return {
            restrict: 'A',
           
            link: function (scope, element, attr) {
                
                var setHeight = function () {
                    var diff = $('footer').height() + element.offset().top;
                    
                    var newHeight = ($(window).height() - diff);

                    if (newHeight > 0) {
                        element.css('height', newHeight + 'px');
                    };
                   
                };

                $(window).on('resize', function () {
                    setHeight();
                });
                // also check on a view change, becuase panels may have come in or out
                scope.$on('$viewContentLoaded', function () {
                    $timeout(setHeight,100);
                });
 
                setHeight();
                //$timeout(, 1000);
            }
        };
    };
    angular
            .module('sw.common')
            .directive('fitContent', ['$window', '$timeout', '$location', fitcontent]);
})();

(function () {
    var dir = function () {



        var link = function (scope, element, attrs) {




            function xlate(n3, propertyName) {
                if (!propertyName) {
                    propertyName = 'a2';
                }
                // get the a2 country code from the n3
                return _.result(_.find(scope.extent, { 'n3': n3 }), propertyName);
            }

            function getFeatureName(f) {
                var id = f.id;
                // this is an iso n3, tranlsate back to a2
                return xlate(id, 'name');

            };
            function getFeatureA2(f) {
                var id = f.id;
                // this is an iso n3, tranlsate back to a2
                return xlate(id);

            };
            function getQuantize() {
                var m = _.result(_.max(scope.values, 'value'), 'value');
                return d3.scale.quantize()
                .domain([0, m])
                .range(d3.range(9).map(function (i) { return "q" + i + "-9"; }));
            }

            //////var extent = africa;

            //////function getExtent() {
            //////    return africa;
            //////}


            function getFeatureColor(f) {
                // first get the id of the feature
                var id = f.id;
                // this is an iso n3, tranlsate back to a2
                var couCode = xlate(id);
                if (!couCode)
                    return 'country';
                //
                //find the value for this country
                var value = _.result(_.find(scope.values, { 'key': couCode }), 'value');
                if (value == undefined) {
                    couCode = xlate(id, 'name')
                    var value = _.result(_.find(scope.values, { 'key': couCode }), 'value');
                };

                if (value == undefined)
                    return 'country';
                return getQuantize()(value) + " country";
            }

            function draw() {
                svg.selectAll(".country")
                    .attr("class", getFeatureColor);
            };

            var projection = d3.geo.mercator(),           //d3.geo.kavrayskiy7(),
            color = d3.scale.category20(),
            graticule = d3.geo.graticule();

            var path = d3.geo.path()
                .projection(projection);

            var svg = d3.select(element[0]).append("svg")
                .attr("width", scope.width)
                .attr("height", scope.height)

                .attr("viewBox", "400 150 250 200");


            function myMouseOver(d,i) {
                var elem = d3.select(this);
                console.log(elem.attr("id"));
                console.log();
                scope.onMouseOver.call(scope, getFeatureName(d), d, elem);
            }
            function myMouseOut(d, i) {
                var elem = d3.select(this);
                console.log(elem.attr("id"));
                scope.onMouseOver.call(scope, getFeatureName(d),d, elem);
            }
            ////svg.append("path")
            ////    .datum(graticule)
            ////    .attr("class", "graticule")
            ////    .attr("d", path);

            ////svg.append("path")
            ////    .datum(graticule.outline)
            ////    .attr("class", "graticule outline")
            ////    .attr("d", path);

            d3.json("assets/mapAddins/readme-world.json", function (error, world) {
                var countries = topojson.feature(world, world.objects.countries).features,
                    neighbors = topojson.neighbors(world.objects.countries.geometries);

                function filter(f) {
                    return (_.findIndex(scope.extent, function (country) {
                        return country.n3 == f.id
                    }) >= 0);
                };
                // extent it the collection of countries that will be drawn 
                var extentFeatures = _.filter(countries, filter);

                svg.selectAll(".country")
                    .data(extentFeatures)
                  .enter()
                      .insert("path", ".graticule")       // insert before the graticule
                          .attr("class", "country")
                          .attr("id", getFeatureA2)
                          .on("click", myMouseOver)
                          //.on("mouseout",  scope.onMouseOut)
                          .attr("d", path)
                          .append("svg:title")
                              .text(getFeatureName)


                draw();
            });
            scope.$watch(function () { return scope.values; }, draw);
        };
        return {
            scope: {
                width: "@",
                height: "@",
                extent: '=',
                values: "=",
                onMouseOver: "=",
                onMouseOut: "="

            },
            restrict: 'EA',
            link: link
        }
    };
    angular
        .module('sw.common')
        .directive('worldMap', [dir]);
})();


(function () {
    // jQuery needed, uses Bootstrap classes, adjust the path of templateUrl
    var dir = function () {
        return {
            restrict: 'E',
            //templateUrl: '/path/to/pdfDownload.tpl.html',
            template: '<a href="" class="btn btn-primary" ng-click="downloadPdf()">Download</a>',
            scope: true,
            link: function (scope, element, attr) {
                var anchor = element.children()[0];

                // When the download starts, disable the link
                scope.$on('download-start', function () {
                    $(anchor).attr('disabled', 'disabled');
                });

                // When the download finishes, attach the data to the link. Enable the link and change its appearance.
                scope.$on('downloaded', function (event, data) {
                    $(anchor).attr({
                        href: 'data:application/pdf;base64,' + data,
                        download: attr.filename
                    })
                        .removeAttr('disabled')
                        .text('Save')
                        .removeClass('btn-primary')
                        .addClass('btn-success');

                    // Also overwrite the download pdf function to do nothing.
                    scope.downloadPdf = function () {
                    };
                });
            },
            controller: ['$scope', '$attrs', '$http', function ($scope, $attrs, $http) {
                $scope.downloadPdf = function () {
                    $scope.$emit('download-start');
                    $http.get($attrs.url).then(function (response) {
                        $scope.$emit('downloaded', response.data);
                    });
                };
            }]
        };
    };
    angular
        .module('sw.common')
        .directive('pdfDownload', [dir]);
        
})();