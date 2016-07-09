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
                inc: 1,
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
                        });
                } else {
                    console.log('stock form not inputted');
                }


            };

        }
    }
});

bioApp.directive('checkDate', function() {
    return {
        require: 'ngModel',
        link: function(scope, elem, attrs, controller) {
            controller.$validators.checkDate = function(inp) {
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
    $scope.clone = {
        name: '2-2',
        aaChanges: 'G140S+Q148H',
        type: "ROD9",
        date: '06/25/2016'
    };

    $scope.plate = {};
    $scope.quads = {};

    $http.get(baseAddress + '/get_all_stocks')
        .success(function(resp) {
            $scope.stockClones = resp;
        });

    $http.get(baseAddress + '/get_all_clones')
        .success(function(resp) {
            $scope.clones = resp;
        });

    $scope.test = function() {
        console.log($scope.quads);
    };
});