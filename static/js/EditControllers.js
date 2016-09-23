angular.module('bioApp').controller('EditCloneController', ['$scope', '$http', 'baseAddress', function($scope, $http, baseAddress) {
    var currentURL = window.location.href.split('/')
    var cloneID = _.isNumber(Number(currentURL[currentURL.length - 1])) ? currentURL[currentURL.length - 1] : -1;

    $http.get(baseAddress + '/get_clone/' + cloneID)
        .success(function(resp) {
            $scope.clone = resp;

            console.log(resp);  
        })
        .error(function(resp) {
            $scope.showAlert(resp.msg, warning=true);
        })
}]);
