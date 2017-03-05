'use strict';

describe('AuthService', function () {
    var $scope, controller, $httpBackend, AuthService;

    beforeEach(function () {
        module('App');

        inject(function ($rootScope, _$httpBackend_, _AuthService_, $http, $q) {
            $scope = $rootScope.$new();
            $httpBackend = _$httpBackend_;
            AuthService = _AuthService_;
        });
    });

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should have user undefined on init', function () {
        expect(AuthService.user).toEqual(undefined);
    });

    it('should set user', function () {
        expect(AuthService.user).toEqual(undefined);
        $httpBackend.expectPOST('/api/login').respond({success: true, data: 'asdf'})
        AuthService
            .login({})
            .then(function (res) {
                expect(AuthService.user).toEqual('asdf');
            })
        $httpBackend.flush();
    });
});
