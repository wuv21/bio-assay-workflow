var bioApp = angular.module('bioApp', []);
var baseAddress = 'http://localhost:8080';

bioApp.config(['$interpolateProvider', function($interpolateProvider) {
    $interpolateProvider.startSymbol('{a');
    $interpolateProvider.endSymbol('a}');
}]);

bioApp.filter('htmlToText', function() {
    return function(text) {
      return text ? String(text).replace(/<[^>]+>/gm, '') : '';
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

bioApp.directive('quadrant', function() {
    return {
        restrict: "E",
        scope: true,
        templateUrl: "/static/template/quadrant.html",
        link: function(scope) {
            scope.quads[scope.$id] = {
                virusStockDate: '',
                selectedClone: null,
                minDrug: 0.0001,
                inc: null,
                numControls: 1,
                drug: null
            };

            scope.updateStockDate = function(option) {
                scope.quads[scope.$id].virusStockDate = option.harvest_date;
            };
        }
    }
});

bioApp.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attrs) {
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
                .width(800)
                .height(500);

            var chart = d3.select(elem[0]);

            scope.$watch('absData', function() {
                if (scope.absData.vals) {
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

bioApp.controller('QuadrantController', function($scope, $http) {
    $scope.plate = {
        name: "Sample Plate Name",
        date: "01/02/1661",
        letter: "A"
    };
    $scope.quads = {};

    // alert settings
    $scope.alertSettings = {
        visible: false,
        message: "",
        warning: false
    };

    $scope.closeAlert = function() {
        $scope.alertSettings.visible = false;
    };

    var showAlert = function(msg, warning) {
        $scope.alertSettings.message = msg;
        $scope.alertSettings.warning = warning;
        $scope.alertSettings.visible = true;
    };

    $scope.getAllData = function() {
        $http.get(baseAddress + '/get_all_stocks')
            .success(function(resp) {
                $scope.stockClones = resp;
        });

        $http.get(baseAddress + '/get_all_clones')
            .success(function(resp) {
                $scope.clones = resp;
            });

        $http.get(baseAddress + '/get_all_drugs')
            .success(function(resp) {
                $scope.allDrugs = resp;
            });
    };

    $scope.refreshData = function() {
        $scope.getAllData();
        showAlert('Virus stocks and drugs updated', warning=false);
    };

    $scope.getAllData();

    $scope.submitPlate = function() {
        $scope.plate.quads = $scope.quads;

        console.log($scope.plate);

        $http.post(baseAddress + '/create_plate', $scope.plate)
            .success(function(resp) {
                showAlert(resp.msg, warning=false);
                window.location = resp.next_url;
            })
            .error(function(resp) {
                showAlert(resp.msg, warning=true);
            });
    }
});

bioApp.controller('StockController', function($scope, $http, $filter) {
    $scope.toggleMenus = {
        newStockOldClone: true,
        newStockNewClone: false
    };

    $scope.stockData = {
        cloneDate: "06/26/2016",
        selectedClone: null,
        virusStockDate: "08/05/2016",
        virusStockFFU: 16000,
        newCName: 'TestClone',
        newCDate: '05/02/2015',
        newCAA: 'A153G',
        newCType: 'ROD9'
    };

    // alert settings
    $scope.alertSettings = {
        visible: false,
        message: "",
        warning: false
    };

    $scope.closeAlert = function() {
        $scope.alertSettings.visible = false;
    };

    var showAlert = function(msg, warning) {
        $scope.alertSettings.message = msg;
        $scope.alertSettings.warning = warning;
        $scope.alertSettings.visible = true;
    };

    $scope.newStockOldCloneOpen = function() {
        $scope.toggleMenus.newStockNewClone = false;
        $scope.toggleMenus.newStockOldClone = !$scope.toggleMenus.newStockOldClone;
    };

    $scope.newStockNewCloneOpen = function() {
        $scope.toggleMenus.newStockOldClone = false;
        $scope.toggleMenus.newStockNewClone = !$scope.toggleMenus.newStockNewClone;
    };

    $http.get(baseAddress + '/get_all_clones')
        .success(function(resp) {
            $scope.clones = resp;
    });

    $scope.createStock = function() {
        var data = {
            stockDate: $scope.stockData.virusStockDate,
            stockFFU: $scope.stockData.virusStockFFU,
            clone: $scope.stockData.selectedClone
        };

        if (data.stockDate && data.stockFFU && data.clone) {
            $http.post(baseAddress + '/create_stock', data)
                .success(function(resp) {
                    showAlert(resp.msg, warning=false);
                })
                .error(function(resp) {
                    showAlert(resp.msg, warning=true);
                });
        } else {
            showAlert('Error in creating stock - please ensure data is inputted correctly', warning=true);
        }
    };

    $scope.createStockAndClone = function() {
        var data = {
            cName: $scope.stockData.newCName,
            cDate: $scope.stockData.newCDate,
            cAA: $scope.stockData.newCAA,
            cType: $scope.stockData.newCType,
            stockDate: $scope.stockData.virusStockDate,
            stockFFU: $scope.stockData.virusStockFFU
        };

        if (data.stockDate && data.stockFFU) {
            $http.post(baseAddress + '/create_clone_and_stock', data)
                .success(function(resp) {
                    showAlert($filter('htmlToText')(resp.msg), warning=false);
                })
                .error(function(resp) {
                    showAlert($filter('htmlToText')(resp.msg), warning=true);
                });
        } else {
            showAlert('Error in creating clone and stock - please ensure data is inputted correctly', warning=true);
        }
    };
});

bioApp.controller('DrugController', function($scope, $http, $filter) {
    // alert settings
    $scope.alertSettings = {
        visible: false,
        message: "",
        warning: false
    };

    $scope.closeAlert = function() {
        $scope.alertSettings.visible = false;
    };

    var showAlert = function(msg, warning) {
        $scope.alertSettings.message = msg;
        $scope.alertSettings.warning = warning;
        $scope.alertSettings.visible = true;
    };

    $scope.newDrug = {
        name: '',
        abbrev: ''
    };

    $scope.createDrug = function() {
        if ($scope.newDrug.name && $scope.newDrug.abbrev) {
            $http.post(baseAddress + '/create_drug', $scope.newDrug)
                .success(function(resp) {
                    showAlert($filter('htmlToText')(resp.msg), warning=false);
                })
                .error(function(resp) {
                    showAlert($filter('htmlToText')(resp.msg), warning=true);
                });
        } else {
            showAlert('Error in creating drug - please ensure data is inputted correctly', warning=true);
        }
    };
});

bioApp.controller('AnalysisController', function($scope, $http) {
    var currentURL = window.location.href.split('/')
    var plateID = _.isNumber(Number(currentURL[currentURL.length - 1])) ? currentURL[currentURL.length - 1] : -1

    // alert settings
    $scope.alertSettings = {
        visible: false,
        message: "",
        warning: false
    };

    $scope.closeAlert = function() {
        $scope.alertSettings.visible = false;
    };

    var showAlert = function(msg, warning) {
        $scope.alertSettings.message = msg;
        $scope.alertSettings.warning = warning;
        $scope.alertSettings.visible = true;
    };

    $scope.selQuad = 0;
    $scope.absData = {};

    $scope.$watch('selQuad', function() {
        if ($scope.quads && $scope.quads[$scope.selQuad]) {
            var parsedVals = $scope.quads[$scope.selQuad].Quadrant_q_abs;
            $scope.absData.id = Number($scope.selQuad);
            $scope.absData.vals = [];

            for (var i=0; i<parsedVals.length; i++) {
                $scope.absData.vals.push({
                    x: $scope.quads[$scope.selQuad].Quadrant_conc_range[i],
                    y0: parsedVals[i][0],
                    y1: parsedVals[i][1]
                });
            }

            $scope.absData.bottom = $scope.quads[$scope.selQuad].regression[1];
            $scope.absData.top = $scope.quads[$scope.selQuad].regression[0];
            $scope.absData.ec = $scope.quads[$scope.selQuad].regression[2];
        }
    });

    $http.get(baseAddress + '/get_plate/' + plateID)
        .success(function(resp) {
            console.log(resp);
            $scope.plate = _.pickBy(resp[0], function(value, key) {return key[0] == "P"});
            $scope.quads = _.orderBy(resp, 'Quadrant_id');

            var parsedVals = $scope.quads[$scope.selQuad].Quadrant_q_abs;
            $scope.absData.id = 0;
            $scope.absData.vals = [];

            for (var i=0; i<parsedVals.length; i++) {
                $scope.absData.vals.push({
                    x: $scope.quads[$scope.selQuad].Quadrant_conc_range[i],
                    y0: parsedVals[i][0],
                    y1: parsedVals[i][1]
                });
            }

            if ($scope.quads[$scope.selQuad].regression) {
                $scope.absData.bottom = $scope.quads[$scope.selQuad].regression[1];
                $scope.absData.top = $scope.quads[$scope.selQuad].regression[0];
                $scope.absData.ec = $scope.quads[$scope.selQuad].regression[2];
            } else {
                showAlert("Unable to calculate regression", warning=true);
            }

        })
        .error(function(resp) {
            if (resp.msg) {
                showAlert(resp.msg, warning=true);
            } else {
                showAlert("No plate to show", warning=true);
            }

        });
});

bioApp.controller('OverviewController', function($scope, $http) {
    // alert settings
    $scope.alertSettings = {
        visible: false,
        message: "",
        warning: false
    };

    $scope.closeAlert = function() {
        $scope.alertSettings.visible = false;
    };

    var showAlert = function(msg, warning) {
        $scope.alertSettings.message = msg;
        $scope.alertSettings.warning = warning;
        $scope.alertSettings.visible = true;
    };

    $scope.plates = [];
    $scope.selectedExp = {};
    $http.get(baseAddress + '/get_all_plates')
        .success(function(resp) {
            $scope.plates = resp;
        });

    $http.get(baseAddress + '/get_all_plate_quadrants')
        .success(function(resp) {
            $scope.quadrants = resp;
        });

    $scope.showQuadrants = function(option) {
        $scope.availableQuads = [];
        if (option && $scope.quadrants) {
            $scope.quadrants.forEach(function(q) {
                if (q.Plate_Reading_id == option.id) {
                    $scope.availableQuads.push(q);
                    console.log(q);
                }
            });
        }
    };

    $scope.stagedQuads = [];
    $scope.addQuads = function() {
        $scope.selectedQuads.forEach(function(x) {$scope.stagedQuads.push(x)});
    }

    $scope.removeQuads = function() {
        _.pullAll($scope.stagedQuads, $scope.addedQuads);
    }
});
