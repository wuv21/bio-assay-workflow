var bioApp = angular.module('bioApp', []);

bioApp.config(['$interpolateProvider', function($interpolateProvider) {
    $interpolateProvider.startSymbol('{a');
    $interpolateProvider.endSymbol('a}');
}]);

bioApp.directive('quadrant', function() {
    return {
        restrict: "E",
        scope: true,
        templateUrl: "/static/template/quadrant.html",
        link: function(scope) {
            scope.quads[scope.$id] = {
                oldStockDateFilter: '07/25/2016',
                oldStockToggle: false,
                newStockOldToggle: false,
                newStockNewToggle: false,
                oldCloneDateFilter: '06/25/2016',
                virusStockDate: null,
                selectedClone: null,
                minDrug: null,
                maxDrug: null,
                inc: null,
                numControls: null,
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

            };

            scope.createStock = function() {

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

    $http.get('http://localhost:8080/get_all_stocks')
        .success(function(resp) {
            $scope.stockClones = resp;
        });

    $http.get('http://localhost:8080/get_all_clones')
        .success(function(resp) {
            $scope.clones = resp;
        });

    $scope.test = function() {
        console.log($scope.quads);
    };

    $scope.testSubmission = function() {
        console.log('here');

        var data = {
            details: $scope.plate,
            quads: $scope.quads
        };

        $http.post('http://localhost:8080/test_post', data)
            .success(function(resp) {
                console.log('here');
        });
    }

});