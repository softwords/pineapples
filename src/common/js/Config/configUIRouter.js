(function () {



    //
    // ui.Router configure
    //
    function urlRouterConfig($urlRouterProvider) {

        // ui-router

        // Here's an example of how you might allow case insensitive urls
        $urlRouterProvider.rule(function ($injector, $location) {
            //what this function returns will be set as the $location.url
            var path = $location.path(), normalized = path.toLowerCase();
            if (path != normalized) {
                //instead of returning a new url string, I'll just change the $location.path directly so I don't have to worry about constructing a new url string and so a new state change is not triggered
                $location.replace().path(normalized);
            }
            // because we've returned nothing, no state change occurs
        })
        .when('', '/home');



    };

    function standardRoutes($stateProvider) {

        $stateProvider
             // 'site' is the parent to manage authorized access
               .state('site', {
                   'abstract': true,
                   resolve: {
                       authorize: ['$auth',
                             function ($auth) {
                                 return $auth.validateUser();
                             }],

                       lookupsResolver: ['Lookups', function (Lookups) {
                           Lookups.init();
                       }]
                       
                   }
               })
                 .state('site.home', {
                     url: '/home',
                     onEnter: ['$auth', '$state', function ($auth, $state) {
                         $state.go($auth.user.home);
                     }]
                 })
       .state('signin', {

           url: '/signin',
           data: {
               roles: []
           },
           views: {
               '@': {
                   templateUrl: 'user/login'
               }


           }

       })
       .state('site.changepassword', {
           url: '/changepassword',
           views: {
               '@': {
                   templateUrl: 'user/ChangePassword',
                   controller: 'AuthorizationController',
                   controllerAs: 'vm'

               }
           }
       })
        .state('restricted', {
            parent: 'site',
            url: '/restricted',
            data: {
                roles: ['Admin']
            },
            views: {
                'content@': {
                    templateUrl: 'user/accessrestricted'
                }
            }
        }).state('accessdenied', {

            url: '/denied',
            data: {
                roles: []
            },
            views: {
                '@': {
                    templateUrl: 'user/accessdenied'
                }
            }
        });
    };
    angular
        .module('sw.common')
        .config(['$urlRouterProvider', urlRouterConfig])
        .config(['$stateProvider', standardRoutes]);

})();