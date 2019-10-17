(function(){
  angular.module('Waila', ['ui.router', 'ngFileUpload'])
    .config(function($stateProvider, $urlRouterProvider){
  
        $urlRouterProvider.when('/*', '/home');
        $urlRouterProvider.otherwise('/home');
        
    
        $stateProvider
        .state('home', {
          url: '/home',
          templateUrl: 'app/home/home.html',
          controller: 'HomeController'
        });

    });
          
}());
