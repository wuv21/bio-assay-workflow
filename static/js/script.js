var bioApp = angular.module('bioApp', []);

bioApp.constant('baseAddress', 'http://localhost:8080');

bioApp.config(['$interpolateProvider', function($interpolateProvider) {
    $interpolateProvider.startSymbol('{a');
    $interpolateProvider.endSymbol('a}');
}]);

bioApp.filter('htmlToText', function() {
    return function(text) {
      return text ? String(text).replace(/<[^>]+>/gm, '') : '';
    };
});

bioApp.filter('isolateDate', function() {
    return function(text) {
      return text == "11/11/1111" ? "Isolate" : text;
    };
});


bioApp.filter('convertFromSqlDate', function() {
  return function(date) {
    var decomp = date.split('-');
    var month = decomp[1],
        day = decomp[2],
        year = decomp[0];

    return month + '/' + day + '/' + year;
  };
});

bioApp.directive('validFile',function() {
  return {
    require: 'ngModel',
    link: function(scope,el,attrs,ngModel){
      //change event is fired when file is selected
      el.bind('change', function() {
        scope.$apply(function() {
          ngModel.$setViewValue(el.val());
          ngModel.$render();
        });
      });
    }
  }
});

bioApp.directive('alert', function() {
    return {
        restrict: "E",
        scope: false,
        templateUrl: "/static/template/alert.html",
        link: function(scope) {
            scope.alertSettings = {
                visible: false,
                message: "",
                warning: false
            };

            scope.closeAlert = function() {
                scope.alertSettings.visible = false;
            };

            scope.showAlert = function(msg, warning) {
                scope.alertSettings.message = msg;
                scope.alertSettings.warning = warning;
                scope.alertSettings.visible = true;
            };
        }
    }
});

bioApp.directive('quadrant', function() {
    return {
        restrict: "E",
        scope: true,
        templateUrl: "/static/template/quadrant.html",
        link: function(scope) {
            scope.quads[scope.$id] = {
                virusStockDate: '',
                selectedClone: null,
                inc: null,
                numControls: 1,
                drug: null,
                concRange: [],
                disabled: true
            };

            // TODO refactor and fix naming of selectedClone...

            // selection filter code
            scope.updateStockDate = function(option) {
                if (option) {
                    scope.quads[scope.$id].virusStockDate = option.Virus_Stock_harvest_date;
                    scope.quads[scope.$id].aaChanges = option.Clone_aa_changes;
                }
            };

            scope.resetFilters = function() {
                scope.quads[scope.$id].virusStockDate = '';
                scope.quads[scope.$id].aaChanges = '';
                scope.quads[scope.$id].selectedClone = '';
            }

            // format option string in clone selection
            scope.formatCloneSelect = function(c) {
                var baseInfo = c.Clone_name + " | " + c.Clone_aa_changes + " | ";

                if (c.Clone_purify_date == "11/11/1111") {
                    return baseInfo + "Isolate";
                } else {
                    return baseInfo + "purified on " + c.Clone_purify_date;
                }
            };

            // concentration range settings
            scope.$watch('quads[$id].numControls', function() {
                scope.quads[scope.$id].concRange = [];
                for (var i=0; i<12 - scope.quads[scope.$id].numControls - 1; i++) {
                    scope.quads[scope.$id].concRange.push({});
                }
            });

            scope.cSelection = {selected: scope.quads[scope.$id] };

            var current_q = scope.quads[scope.$id];
            scope.serialFill = function() {
                if (current_q.inc && current_q.concRange[0].step && current_q.numControls) {
                    var minimum = Math.round(Math.log10(current_q.concRange[0].step));

                    if (current_q.inc == 'log10') {
                        var maximum = 12 - current_q.numControls - 1 + minimum;
                        var c_range = [];
                        for (var i=minimum; i<maximum; i++) {
                            c_range.push(Math.pow(10, i));
                        }
                    } else {
                        var maximum = Math.trunc((12 - current_q.numControls + minimum) / 2)
                        var c_range = [];

                        var test = String(current_q.concRange[0].step);
                        if (test.charAt(test.length - 1) == '4') {
                            for (var i=0; i<Math.round((12 - current_q.numControls) / 2 - 1); i++) {
                                c_range.push(current_q.concRange[0].step * Math.pow(10, i));
                                c_range.push(current_q.concRange[0].step / 4.0 * Math.pow(10, i + 1));
                            }
                        } else {
                            for (var i=minimum; i<maximum-1; i++) {
                                c_range.push(Math.pow(10, i));
                                c_range.push(4.0 * Math.pow(10, i));
                            }
                        }
                    }

                    current_q.concRange.forEach(function(value, index) {
                        value.step = c_range[index];
                    });

                } else {
                    scope.showAlert('Make sure number of controls, minimum concentration, and increment are filled out', true);
                }
            };
        }
    }
});

bioApp.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function(scope, element, attrs) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                };
                reader.readAsText(changeEvent.target.files[0]);
            });
        }
    }
}]);

bioApp.directive('drcChart', function() {
    return {
        restrict: 'E',
        scope: false,
        link: function(scope, elem) {
            var myChart = DRCChart()
                .width(960)
                .height(500);

            var chart = d3.select(elem[0]);

            scope.$watch('absData', function() {
                if (scope.absData.datasets.length > 0) {
                    chart.datum([scope.absData])
                        .call(myChart);
                }
            }, true);
        }
    };
});

bioApp.directive('checkDate', function() {
    return {
        require: 'ngModel',
        link: function(scope, elem, attrs, controller) {
            controller.$validators.checkDate = function(inp) {
                if (inp == undefined) {
                    return false;
                }

                var splitDate = inp.split('/');

                if (splitDate.length != 3) {
                    return false;
                }

                var month = splitDate[0];
                var day = splitDate[1];
                var year = splitDate[2];

                if (month.length != 2 || Number(month) < 0 || Number(month) > 13) {
                    return false;
                } else if (day.length != 2 || Number(day) < 0 || Number(day) > 31) {
                    return false;
                } else if (year.length != 4) {
                    return false;
                }

                return true;
            }
        }
    }
});

bioApp.directive('modalDialog', function() {
    return {
        restrict: "E",
        scope: {
            show: "="
        },
        replace: true,
        transclude: true,
        link: function(scope, element, attrs) {
            scope.dialogStyle = {};
            if (attrs.width)
              scope.dialogStyle.width = attrs.width;
            if (attrs.height)
              scope.dialogStyle.height = attrs.height;
            scope.hideModal = function() {
              scope.show = false;
            };
        },
        templateUrl: "/static/template/modalDialog.html"
    }
});
