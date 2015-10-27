(function () {
    var ctrlr = function ($scope, $state, $auth, $global) {

        // control fullscreen on / off
        $global.set('fullscreen', true);
        $scope.$on('$destroy', function () {
            $global.set('fullscreen', false);
        });
        $scope.messageText = '';
        $scope.rememberMe = false;
        $scope.logIn = function (user, password) {

            // ng-token-auth has already added submitLogin to $rootScope
            // we wrap that with a "logIn function that will pass a flat POSt value, not a JSON object
            // added this to convert to parameter string
            var params = { grant_type: 'password', username: user, password: password };
            var flat = $.param(params);
            var opts;
            if (!$scope.rememberMe) {
                opts = { storage: 'sessionStorage' };
            }
            else {
                opts = { storage: 'localStorage' };
            }
            $scope.messageText = '';
            $scope.loginState = 'Logging in...'
            $auth.submitLogin(flat, opts)
                .then(function () {
                    $scope.loginState = "Successful...please wait"
                    if ($scope.returnToState) $state.go($scope.returnToState.name, $scope.returnToStateParams);
                    else $state.go('site.home');        // 2015 02 11 allow a customisable home site
                },
                function (response) {
                    $scope.messageText = 'Login failed';
                    $scope.loginState = "Log In";
                });
        };
        $scope.loginState = "Log In";

    };

    angular.module('sw.common')
        .controller('LoginController', ['$scope', '$state', '$auth', '$global',ctrlr]);
      //.controller('HomeCtrl', ['$scope', '$state',
      //  function ($scope, $state) {

      //  }
      //]);

})();