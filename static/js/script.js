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
            scope.oldCloneToggle[scope.$id] = false;
            scope.newCloneToggle[scope.$id] = false;

            scope.oldCloneOpen = function() {
                scope.newCloneToggle[scope.$id] = false;
                scope.oldCloneToggle[scope.$id] = !scope.oldCloneToggle[scope.$id];
            }

            scope.newCloneOpen = function() {
                scope.oldCloneToggle[scope.$id] = false;
                scope.newCloneToggle[scope.$id] = !scope.newCloneToggle[scope.$id];
            }
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

    $scope.newCloneToggle = {};
    $scope.oldCloneToggle = {};
    $scope.selectedClones = {};
    
    $scope.quadrants = [];

    $http.get('http://localhost:8080/test')
        .success(function(resp) {
            console.log(resp);
        });
});