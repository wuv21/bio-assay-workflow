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

bioApp.directive('quadrant', function() {
    return {
        restrict: "E",
        scope: true,
        templateUrl: "/static/template/quadrant.html",
        link: function(scope) {
            scope.quads[scope.$id] = {
                virusStockDate: '08/01/2016',
                selectedClone: null,
                minDrug: 5,
                inc: null,
                numControls: 4,
                drug: null
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

            scope.$watch('testData', function() {
                chart.datum([scope.testData])
                    .call(myChart);
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
    var plateID = currentURL[currentURL.length - 1]

    var y0 = [116.136,106.434,124.895,110.316,94.625,49.778,4.917,9.014,6.047,5.956]
    var y1 = [133.274,122.674,102.343,142.231,128.382,50.975,6.529,11.635,6.225,6.919]
    var x = [0.0001,0.001,0.01,0.1,1.0,10.0,100.0,1000.0,10000.0,100000.0]

    var raw_vals = [];
    for (var i = 0; i < y0.length; i++) {
        raw_vals.push({
            x: x[i],
            y0: y0[i],
            y1: y1[i]
        });
    }

    $scope.testData = {
        id: 0,
        vals: raw_vals,
        bottom: 121.2,
        top: 5.215,
        ec: 6.699
    };

    $scope.selQuad = 1;

    $http.get(baseAddress + '/get_plate/' + plateID)
        .success(function(resp) {
            $scope.plate = _.pickBy(resp[0], function(value, key) {return key[0] == "P"});
            $scope.quads = _.orderBy(resp, 'Quadrant_id');
        });
});
