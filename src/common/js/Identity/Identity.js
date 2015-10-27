'use strict';
(function() {

    // adapted from http://plnkr.co/edit/UkHDqFD8P7tTEqSaCOcc?p=preview
    // see also http://stackoverflow.com/questions/22537311/angular-ui-router-login-authentication
     

    // authorization service's purpose is to wrap up authorize functionality
    // it basically just checks to see if the principal is authenticated and checks the root state 
    // to see if there is a state that needs to be authorized. if so, it does a role check.
    // this is used by the state resolver to make sure when you refresh, hard navigate, or drop onto a
    // route, the app resolves your identity before it does an authorize check. after that,
    // authorize is called from $stateChangeStart to make sure the principal is allowed to change to
    // the desired state
    
    var auth = function ($q, $rootScope, $state, $auth) {

        var isInRole = function (role, userRoles) {
            //if (!_authenticated || !userRoles) return false;

            // a modification to eliminate a lot of work
            if (role == 'authenticated') return true;

            return userRoles.indexOf(role) != -1;
        };
        var isInAnyRole = function (roles, userRoles) {
            //if (!_authenticated || !userRoles) return false;

            for (var i = 0; i < roles.length; i++) {
                if (isInRole(roles[i], userRoles)) return true;
            }

            return false;
        };
        
        return {
           

            authorize: function () {
                var d = $q.defer(); 
                $auth.validateUser()
                    .then(function () {
                       
                      
                        if ($rootScope.toState.data.roles && $rootScope.toState.data.roles.length > 0) {
                            if (!$auth.userIsAuthenticated) {
                                d.reject();
                            }                            
                            else {
                                // ue is signed in are they in a role?
                                if (isInAnyRole($rootScope.toState.data.roles, $auth.user.roles)) {
                                    // good to go
                                    d.resolve();
                                }
                                else {
                                    d.reject();
                               }
                            };
                        }
                        else {
                            // no roles required anyway   
                            d.resolve();
                        };
                          
                    }
                  , function () {        // fail to validate but can proceed still if no security required
                      d.reject();
                  });
                return d.promise;
            }
        };
    };



    angular
        .module('sw.common')
        .factory('authorization', ['$q','$rootScope', '$state', '$auth',auth])
  //      .factory('principal', ['$q', '$auth', prin])
      
      .run(['$rootScope', '$state', '$stateParams','$auth', 'authorization', 
        function ($rootScope, $state, $stateParams, $auth, authorization) {
           
            $rootScope.$on('$locationChangeStart', function (event, toUrl, fromUrl) {
                console.log('$locationChangeStart: ' + fromUrl + '=>' + toUrl)
            });
            $rootScope.$on('$locationChangeSuccess', function (event, toUrl, fromUrl) {
                console.log('$locationChangeSuccess: ' + fromUrl + '=>' + toUrl)
            });


            $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
                $rootScope.toState = toState;
                $rootScope.toStateParams = toStateParams;
                console.log('$stateChangeStart: ' + toState.name)
               //authorization.authorize();
                
            });
          
            $rootScope.$on('$stateChangeSuccess', function (event, toState, toStateParams, fromState, fromStateParams) {
                console.log('$stateChangeSuccess: ' + fromState.name + '=>' + toState.name)
                //authorization.authorize();

            });


            $rootScope.$on('$stateChangeError', function (event, toState, toStateParams, fromState, fromStateParams, error) {
                console.log('$stateChangeError: ' + fromState.name + '=>' + toState.name + ':' + error.reason)
                console.log(error);
                //authorization.authorize();
                // now we may want to go to Access Denied or login, and probably return 
                switch (error.reason)
                {
                    case 'unauthorized':
                        if (error.errors[0] = 'No credentials') {
                            $state.go('signin');
                        }
                        else {
                            $state.go('denied');
                        };
                        break;
                    default:
                        break;
                            
                }

            });

            $rootScope.$on('$stateNotFound', function (event, unfoundState, fromState, fromStateParams, error) {
                console.log('$stateNotFound: ' + unfoundState)
                //authorization.authorize();

            });
            $rootScope.$on('$viewContentLoading', function (event, viewConfig) {
                console.log('$viewContentLoading: ' );
                console.log(viewConfig);
                //authorization.authorize();

            });
            $rootScope.$on('$viewContentLoaded', function (event) {
                console.log('$viewContentLoaded: ');
            });

            // in each of these circumstances, we just need the principal identity set
            $rootScope.$on('auth:login-success', function (ev, user) {
                console.log("auth:login-success: ");
                console.log(user);
            });
            $rootScope.$on('auth:login-error', function (ev,error) {
                console.log("auth:login-error");
                console.log(error.reason);
                console.log(error);
               
            });
            $rootScope.$on('auth:validation-success', function (ev, user) {
                console.log("auth:validation-success: ");
                console.log(user);
                //principal.identity = user;;
                //principal.isAuthenticated = true;
            });
            $rootScope.$on('auth:validation-error', function (ev, error) {
                console.log("auth:validation-error");
                console.log(error.reason);
                console.log(error);

            });

            $rootScope.$on('auth:logout-success', function (ev) {
                console.log("auth:logout-success");
                // go back to signin
                $state.go('signin');
            });
            $rootScope.$on('auth:logout-error', function (ev, error) {
                console.log("auth:logout-error: ");
                console.log(error.reason);
                console.log(error);
            });

        }
      ]);
})();