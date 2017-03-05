var App = angular.module('App', ['ngRoute']);

App.config(function($interpolateProvider, $httpProvider, $routeProvider) {
    $interpolateProvider.startSymbol('{{');
    $interpolateProvider.endSymbol('}}');
    $routeProvider
        .when('/login', {
            controller: 'LoginController',
            controllerAs: 'vm',
            templateUrl: 'login.html'
        })
        .when('/signup', {
            controller: 'SignupController',
            controllerAs: 'vm',
            templateUrl: 'signup.html'
        })
});

App.service('AuthService', ['$http', '$q', '$rootScope', function($http, $q, $rootScope) {
    var Service = {}

    function postData(url, userdata) {
        return $q(function(resolve, reject) {
            $http({
                method: 'POST',
                url: url,
                data: userdata
            })
                .then(function(res) {
                    if (res.data.success) {
                        Service.user = res.data.data;
                        console.log(url, 'got data', res.data);
                        $rootScope.$broadcast('UserLogIn', Service.user);
                        return resolve(Service.user);
                    }
                    console.log(url, 'error', res.data);
                    reject(res.data);
                });
        });
    }

    Service.login = function(userdata) {
        return postData('/api/login', userdata);
    };

    Service.signup = function(userdata) {
        return postData('/api/signup', userdata);
    };

    return Service;
}]);

App.controller('HomeController', function HomeController($scope, AuthService) {   
    var vm = this;
    $scope.$on('UserLogIn', function (event, user) {
        vm.user = user;
    })
});

App.controller('LoginController', function LoginController($http, AuthService, $scope, $location) {   
    var vm = this;
    vm.userdata = {};

    vm.login = function() {
        AuthService
            .login(vm.userdata)
            .then(function (data) {
                vm.user = data;
                $location.path('/').replace();
            });
    }
});

App.controller('SignupController', function SignupController($http, AuthService, $scope, $location) {   
    var vm = this;
    vm.userdata = {};

    vm.signup = function() {
        AuthService
            .signup(vm.userdata)
            .then(function (data) {
                vm.user = data;
                $location.path('/').replace();
            });
    }
});


App.directive('stringUpdater', function() {
    return {
        restrict: 'EA',
        scope: {
            stringModel: '=?',
        },
        template: [
            '<input type="text" ng-model="vm.stringModel" ng-keyup="vm.handleKeyUp($event)" />',
            '<p>{{vm.stringModel}}</p>',
        ].join(''),
        controllerAs: 'vm',
        controller: function() {
            var vm = this;
            vm.handleKeyUp = function($event) {
                if ($event.keyCode === 13) {
                    console.log(vm.stringModel);
                }
            }
        },
        link: function() {}
    }
});
