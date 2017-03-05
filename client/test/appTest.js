'use strict';

describe('HomeController', function () {
    var $scope, controller, $httpBackend;

    beforeEach(function () {
        module('App');

        inject(function ($controller, $rootScope, _$httpBackend_) {
            $scope = $rootScope.$new();
            $httpBackend = _$httpBackend_;

            controller = $controller('HomeController', {
                $scope: $scope,
            });
        });
    });

    it('should have user undefined on init', function () {
        expect(controller.user).toEqual(undefined);
    });

    it('should update user on UserLogIn event', function () {
        expect(controller.user).toEqual(undefined);
        $scope.$broadcast('UserLogIn', 'asdf');
        expect(controller.user).toEqual('asdf');
    });
});

describe('LoginController', function () {
    var $scope, controller, $httpBackend;

    beforeEach(function () {
        module('App');

        inject(function ($controller, $rootScope, _$httpBackend_) {
            $scope = $rootScope.$new();
            $httpBackend = _$httpBackend_;

            controller = $controller('LoginController', {
                $scope: $scope,
            });
        });
    });

    it('should have user undefined on init', function () {
        expect(controller.user).toEqual(undefined);
    });

    it('should update user on login', function () {
        expect(controller.user).toEqual(undefined);
        $httpBackend.expectPOST('/api/login').respond({success: true, data: 'asdf'})
        controller.login({});
        $httpBackend.flush();
        expect(controller.user).toEqual('asdf');
    });
});

describe('SignupController', function () {
    var $scope, controller, $httpBackend;

    beforeEach(function () {
        module('App');

        inject(function ($controller, $rootScope, _$httpBackend_) {
            $scope = $rootScope.$new();
            $httpBackend = _$httpBackend_;

            controller = $controller('SignupController', {
                $scope: $scope,
            });
        });
    });

    it('should have user undefined on init', function () {
        expect(controller.user).toEqual(undefined);
    });

    it('should update user on signup', function () {
        expect(controller.user).toEqual(undefined);
        $httpBackend.expectPOST('/api/signup').respond({success: true, data: 'asdf'})
        controller.signup({});
        $httpBackend.flush();
        expect(controller.user).toEqual('asdf');
    });
});
