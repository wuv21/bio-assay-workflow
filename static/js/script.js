var bioApp = angular.module('bioApp', ['ui.bootstrap']);

bioApp.config(['$interpolateProvider', function($interpolateProvider) {
    $interpolateProvider.startSymbol('{a');
    $interpolateProvider.endSymbol('a}');
}]);

bioApp.directive('quadrant', function() {
    return {
        restrict: "E",
        scope: true,
        templateUrl: "/static/template/quadrant.html",
        link: function(scope, elem, attrs) {
            scope.quads[scope.$id] = {
                oldCloneFilter: '07/25/2016',
                oldStockToggle: false,
                newStockOldToggle: false,
                newStockNewToggle: false,
                virusStockDate: null,
                selectedClone: null,
                minDrug: null,
                maxDrug: null,
                inc: null,
                numControls: null,
                drug: null,
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

                if (month.length != 2 && Number(month) < 0 && Number(month) > 13) {
                    return false;
                } else if (day.length != 2 && Number(day) < 0 && Number(day) > 31) {
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
        date: '06/25/2016'
    };
    
    $scope.quads = {};

    $http.get('http://localhost:8080/get_all_clones')
        .success(function(resp) {
            $scope.clones = resp;
            console.log(resp);
        });
});