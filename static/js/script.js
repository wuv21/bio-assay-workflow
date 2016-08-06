var bioApp = angular.module('bioApp', []);
var baseAddress = 'http://localhost:8080';

bioApp.config(['$interpolateProvider', function($interpolateProvider) {
    $interpolateProvider.startSymbol('{a');
    $interpolateProvider.endSymbol('a}');
}]);

bioApp.directive('quadrant', function($http) {
    return {
        restrict: "E",
        scope: true,
        templateUrl: "/static/template/quadrant.html",
        link: function(scope) {
            scope.quads[scope.$id] = {
                virusStockDate: '08/01/2016',
                virusStockFFU : 55555,
                selectedClone: null,
                minDrug: 5,
                // maxDrug: 10,
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
        link: function (scope, element, attributes) {
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
    $scope.alertVisible = false;
    $scope.alertMessage = "Hello";
    $scope.closeAlert = function() {
        $scope.alertVisible = false;
    };

    $http.get(baseAddress + '/get_all_stocks')
        .success(function(resp) {
            $scope.stockClones = resp;
        });

    $http.get(baseAddress + '/get_all_clones')
        .success(function(resp) {
            $scope.clones = resp;
        });



    $scope.testSubmission = function() {
        $scope.plate.quads = $scope.quads;
        console.log($scope.plate);

        $http.post(baseAddress + '/testPost', $scope.plate)
            .success(function(resp) {
                console.log(resp);
                if (resp == "no data") {
                    $scope.alertMessage = "ALERT: " + resp;
                    $scope.alertVisible = false;
                }
            })
            .error(function(resp) {
                console.log("error");
            });
    }
});

bioApp.controller('StockController', function($scope, $http) {
    $scope.toggleMenus = {
        newStockOldClone: true,
        newStockNewClone: false
    };

    $scope.stockData = {
        cloneDate: "06/26/2016",
        selectedClone: null,
        virusStockDate: "08/05/2016",
        virusStockFFU: 16000,
        newCName: '',
        newCDate: '',
        newCAA: '',
        newCType: '',
    };

    // alert settings
    $scope.alertSettings = {
        visible: false,
        message: "",
        warning: false
    }

    $scope.closeAlert = function() {
        $scope.alertSettings.visible = false;
    };

    var showAlert = function(msg, warning) {
        $scope.alertSettings.message = msg;
        $scope.alertSettings.warning = warning;
        $scope.alertSettings.visible = true;
    }

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
                    showAlert('Stock successfully created', warning=false);
                })
                .error(function(resp) {
                    showAlert('Error in creating stock - please ensure data is inputted correctly', warning=true);
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
                    showAlert('Clone and stock successfully created', warning=false);
                })
                .error(function(resp) {
                    showAlert('Error in creating clone and stock - please ensure data is inputted correctly', warning-true);
                });
        } else {
            showAlert('Error in creating clone and stock - please ensure data is inputted correctly', warning-true);
        }
    };
});
