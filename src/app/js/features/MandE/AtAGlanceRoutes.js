// At A Glance

(function () {
    var routes = function ($stateProvider) {
        $stateProvider
            .state('site.ataglance', {
                url: '/ataglance',
                abstract: true,

                resolve: {
                    // resolve the VERM data first
                    vermData: ['mandeAPI', function (api) {
                        return api.vermdata();
                    }],
                    ripePineapple: ['Pineapple', function (svc) { return svc; }]
                }
            })
            .state('site.ataglance.kemis', {
                url: '/kemis',
                abstract: true,
            })

            .state('site.ataglance.siemis', {
                url: '/siemis',
                abstract: true,
            })

             .state('site.ataglance.kemis.pri', {
                 url: '/pri',
                 data: {
                    selectedEdLevel: 'PRI',
                    selectedSchoolType: 'P',
                    selectedSector: 'PRI'
                 },
                 views: {

                     "@": {
                         templateUrl: "mande/ataglance/kemis/pri",       // begin move to server-side mvc routes
                         controller: 'AtAGlance',
                         controllerAs: "vm"
                     }
                 }
             })

            .state('site.ataglance.siemis.pri', {
                url: '/pri',
                data: {
                    selectedEdLevel: 'PRI',
                    selectedSchoolType: 'P',
                    selectedSector: 'PRI'
                },
                views: {

                    "@": {
                        templateUrl: "mande/ataglance/siemis/pri",       // begin move to server-side mvc routes
                        controller: 'AtAGlance',
                        controllerAs: "vm"
                    }
                }
            })

            .state('site.ataglance.kemis.js', {
                url: '/js',
                data: {
                    selectedEdLevel: 'JS',
                    selectedSchoolType: 'JS',
                    selectedSector: 'JSS'
                },
                views: {

                    "@": {
                        templateUrl: "mande/ataglance/kemis/js",       // begin move to server-side mvc routes
                        controller: 'AtAGlance',
                        controllerAs: "vm"
                    }
                }
            })
            .state('site.ataglance.kemis.ss', {
                url: '/ss',
                data: {
                    selectedEdLevel: 'SS',
                    selectedSchoolType: 'SS',
                    selectedSector: 'SEC'
                },
                views: {

                    "@": {
                        templateUrl: "mande/ataglance/kemis/ss",       // begin move to server-side mvc routes
                        controller: 'AtAGlance',
                        controllerAs: "vm"
                    }
                }
            });

    };

    angular
      .module('pineapples')
      .config(['$stateProvider', routes])
   

})();