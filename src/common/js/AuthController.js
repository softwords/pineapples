(function () {
    var authorizationctlr = function ($scope, $auth, pinesNotifications) {
        var self = this;

        self.oldPassword = '';
        self.newPassword = '';
        self.confirmPassword = '';

        self.ChangePassword = changePassword;

        // notifications

        $scope.$on('auth:password-change-success', function () {
            pinesNotifications.notify({
                title: 'New Thing',
                text: 'Just to let you know, something happened.',
                type: 'info'
            });
        });

        // implementation
        function changePassword() {
            // this object has to correspond to the ChangePasswordBindingModel
            // that is defined in AccountBindingModels in Win Api
            var params = {
                OldPassword: self.oldPassword,
                NewPassword: self.newPassword,
                ConfirmPassword: self.confirmPassword
            }
            $auth.updatePassword(params);
        }
    };

    angular
        .module('sw.common')
        .controller('AuthorizationController', ['$scope','$auth', 'pinesNotifications', authorizationctlr]);


})();