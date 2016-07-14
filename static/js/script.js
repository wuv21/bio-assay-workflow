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
                oldStockToggle: false,
                newStockOldToggle: false,
                newStockNewToggle: false,
                oldCloneDateFilter: '06/26/2016',
                virusStockDate: '08/01/2016',
                virusStockFFU : 55555,
                selectedClone: null,
                newCName: null,
                newCDate: null,
                newCAA: null,
                newCType: null,
                minDrug: 5,
                maxDrug: 10,
                inc: null,
                numControls: 4,
                drug: null
            };

            scope.oldStockOpen = function() {
                scope.quads[scope.$id].newStockOldToggle = false;
                scope.quads[scope.$id].newStockNewToggle = false;
                scope.quads[scope.$id].oldStockToggle = !scope.quads[scope.$id].oldStockToggle;
            };

            scope.newStockOldOpen = function() {
                scope.quads[scope.$id].oldStockToggle = false;
                scope.quads[scope.$id].newStockNewToggle = false;
                scope.quads[scope.$id].newStockOldToggle = !scope.quads[scope.$id].newStockOldToggle;
            };

            scope.newStockNewOpen = function() {
                scope.quads[scope.$id].oldStockToggle = false;
                scope.quads[scope.$id].newStockOldToggle = false;
                scope.quads[scope.$id].newStockNewToggle = !scope.quads[scope.$id].newStockNewToggle;
            };

            scope.createStockAndClone = function() {
                var data = {
                    cName: scope.quads[scope.$id].newCName,
                    cDate: scope.quads[scope.$id].newCDate,
                    cAA: scope.quads[scope.$id].newCAA,
                    cType: scope.quads[scope.$id].newCType,
                    stockDate: scope.quads[scope.$id].virusStockDate,
                    stockFFU: scope.quads[scope.$id].virusStockFFU
                };

                if (data.stockDate && data.stockFFU) {
                    $http.post(baseAddress + '/create_clone_and_stock', data)
                        .success(function(resp) {
                            alert('Clone and stock successfully created.');
                        })
                        .error(function(resp) {
                            alert('Error in creating clone and stock - please ensure data is inputted correctly');
                        });
                } else {
                    console.log('form not inputted');
                }
            };

            scope.createStock = function() {
                var data = {
                    stockDate: scope.quads[scope.$id].virusStockDate,
                    stockFFU: scope.quads[scope.$id].virusStockFFU,
                    clone: scope.quads[scope.$id].selectedClone
                };

                if (data.stockDate && data.stockFFU && data.clone) {
                    $http.post(baseAddress + '/create_stock', data)
                        .success(function(resp) {
                            alert('Stock successfully created');
                        })
                        .error(function(resp) {
                            alert('Error in creating stock - please ensure data is inputted correctly');
                        });
                } else {
                    console.log('stock form not inputted');
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

bioApp.controller('MainController', function($scope, $http) {
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