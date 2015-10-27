(function() {

    var routes = function ($stateProvider) {
        $stateProvider
          .state('site.xycharts', {
              url: '/xycharts',

              views: {
                  "navbar@": {
                      templateUrl: "schoolscatter/searcher",
                      controller: "FilterController",
                      controllerAs: "vm"
                  },
                  "@": {
                      templateUrl: "schoolscatter/chart",       // begin move to server-side mvc routes
                      controller: 'SchoolScatterController',
                      controllerAs: "vm"
                  }
              },
              resolve: {
                  theFilter: 'SchoolScatterFilter',
                  tableOptions: function () { return '';}
              }
          });

    }

    angular
        .module('pineapples')
        .config(['$stateProvider', routes])


})();