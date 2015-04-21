'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

        .controller('View1Ctrl', ['$scope', function ($scope) {
            $scope.parsedData;
            $scope.devices = {mobile: 10, desktop: 1, tablet: 1};
            var pie,
                    pieParams = {
                      "size": {
                        "canvasHeight": 300,
                        "canvasWidth": 300
                      },
                      "data": {
                        "sortOrder": "value-asc",
                        "content": [
                          {
                            "label": "Mobile",
                            "value": $scope.devices.mobile,
                            "color": "RGB(201, 218, 248)"
                          },
                          {
                            "label": "Desktop",
                            "value": $scope.devices.desktop,
                            "color": "RGB(234, 208, 220)"
                          },
                          {
                            "label": "Tablet",
                            "value": $scope.devices.tablet,
                            "color": "RGB(252, 229, 204)"
                          }
                        ]
                      },
                      "labels": {
                        "outer": {
                          "pieDistance": 32
                        },
                        "inner": {
                          "hideWhenLessThanPercentage": 100
                        },
                        "mainLabel": {
                          "fontSize": 11
                        },
                        "percentage": {
                          "color": "#ffffff",
                          "decimalPlaces": 0
                        },
                        "value": {
                          "color": "#adadad",
                          "fontSize": 11
                        },
                        "lines": {
                          "enabled": true
                        }
                      },
                      "effects": {
                        "pullOutSegmentOnClick": {
                          "effect": "linear",
                          "speed": 400,
                          "size": 8
                        },
                        "highlightSegmentOnMouseover": false
                      },
                      "misc": {
                        "pieCenterOffset": {
                          "x": 50,
                          "y": -10
                        }
                      }
                    };

            var filterData = function (data, scope) {
              var output = [],
                      today = new Date('7/31/2014 23:59:59 GMT-0700 (PDT)'),
                      parseDate = d3.time.format("%x").parse,
                      filteredData = _.filter(data, function (element) {
                        var inTimeRange = today - new Date(element.Date + " " + element.Time) < scope.timeRange * 86400000;
                        debugger;
                        return inTimeRange && scope.segment.gender === "all" || scope.segment.gender === element.Gender;
                      });
              scope.segment.genderCount = _.countBy(filteredData, function (element) {
                return element.Gender;
              });
              scope.devices = _.countBy(filteredData, function (element) {
                return element.Device;
              });
              filteredData = _.countBy(filteredData, function (element) {
                return element.Date;
              });
              for (var key in filteredData) {
                output.push({Date: parseDate(key), Activity: filteredData[key] / data.length * 100});
              }
              return _.sortBy(output, function (element) {
                return element.Date;
              });
              // if trend line, do not count by, sort by Date + Time
            };
            /*
             * on load
             *  draw axes.
             *  set filters - all/male/female, mean/trend, all/14/7/3 days
             *  create draw algorithm that checks filters
             *  add transitions
             *
             */

            $scope.init = function () {
              d3.csv("SampleData.csv", function (data) {
                $scope.parsedData = data;
              });
              $scope.renderCharts($scope.parsedData, $scope);
            };

            $scope.renderCharts = function (data) {
              var chartData = filterData(data, $scope);
              var margin = {top: 20, right: 20, bottom: 30, left: 50},
              width = 960 - margin.left - margin.right,
                      height = 300 - margin.top - margin.bottom;

              var x = d3.time.scale()
                      .range([0, width]);

              var y = d3.scale.linear()
                      .range([height, 0]);

              var xAxis = d3.svg.axis()
                      .scale(x)
                      .orient("bottom");

              var yAxis = d3.svg.axis()
                      .scale(y)
                      .orient("left");

              var line = d3.svg.line()
                      .x(function (d) {
                        return x(d.Date);
                      })
                      .y(function (d) {
                        return y(d.Activity);
                      });

              d3.select("svg").html("");

              var svg = d3.select("svg")
                      .attr("width", width + margin.left + margin.right)
                      .attr("height", height + margin.top + margin.bottom)
                      .append("g")
                      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

              x.domain(d3.extent(chartData, function (d) {
                return d.Date;
              }));
              y.domain(d3.extent(chartData, function (d) {
                return d.Activity;
              }));

              svg.append("g")
                      .attr("class", "x-axis")
                      .attr("transform", "translate(0," + height + ")")
                      .call(xAxis);

              svg.append("g")
                      .attr("class", "y-axis")
                      .call(yAxis)
                      .append("text")
                      .attr("transform", "rotate(-90)")
                      .attr("y", 6)
                      .attr("dy", ".71em")
                      .style("text-anchor", "end");

              svg.append("path")
                      .datum(chartData)
                      .attr("class", "line")
                      .attr("d", line);
            };

            $scope.$watch("devices", function (newvalue, oldvalue, scope) {
              pieParams.data.content[0].value = scope.devices.mobile;
              pieParams.data.content[1].value = scope.devices.desktop;
              pieParams.data.content[2].value = scope.devices.tablet;

              pie && pie.destroy();
              pie = new d3pie("pieChart", pieParams);
            });

            $scope.$watch("timeRange", function (newvalue, oldvalue, scope) {
              $scope.renderCharts($scope.parsedData, $scope);
            });

            $scope.$watch("segment.gender", function (newvalue, oldvalue, scope) {
              $scope.renderCharts($scope.parsedData, $scope);
            });
}]);