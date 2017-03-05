'use strict';

describe('App tests', function () {
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
