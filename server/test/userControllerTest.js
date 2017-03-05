const supertest = require('supertest');
const superagent = require('superagent');
const mongoose = require('mongoose');
const {expect} = require('chai');
const sinon = require('sinon');
const express = require('express');
require('sinon-mongoose');
const proxyquire = require('proxyquire');
const User = require('../models/User');

describe('user auth tests', () => {

  const formdata = {
    email: 'te.st@gmail.com',
    password: 'asdf',
    confirmPassword: 'asdf'
  };

  const userdata = {
    email: formdata.email,
    password: formdata.password
  };

  let APP_URL;
  let LOGIN_URL;
  let HOME_URL;

  describe('With signed in user', () => {
    let app;
    let user1;
    let request;

    after((done) => {
      user1.remove()
      app.server.close();
      done();
    });

    before((done) => {
      user1 = new User(userdata);
      user1.save();

      app = require('../app.js');
      app
        .init()
        .then(() => {
          APP_URL = app.get('server_url')
          LOGIN_URL = APP_URL + '/login';
          HOME_URL = APP_URL + '/';
          request = superagent.agent();
          login(request, done);
        });
    });

    function login(request, done) {
      request
        .post(LOGIN_URL)
        .send(userdata)
        .end((err, res) => {
          expect(res.redirects).to.eql([HOME_URL]);
          expect(res.status).to.equal(200);
          done();
        });
    }

    it('should redirect when logged in', (done) => {
      request
        .get(LOGIN_URL)
        .end((err, res) => {
          expect(res.redirects).to.eql([HOME_URL]);
          expect(res.status).to.equal(200);
          done();
        })
    });
  });


  describe('POST /signup', () => {
    let UserMock, UserMockConstructor, request, app;

    beforeEach(done => {
      // User mock expects find with same email
      UserMock = sinon.mock(User);
      UserMock
        .expects('findOne')
        .withArgs({email: userdata.email})
        .yields(null, sinon.mock(new User(userdata)));

      // User mock expects constructor with same userdata
      UserMockConstructor = sinon.stub();
      UserMockConstructor.withArgs(userdata).returns(UserMock);
      UserMockConstructor.throws();

      const userRoute = proxyquire('../controllers/user.js', {
        '../models/User': UserMockConstructor
      });
      app = proxyquire('../app.js', {'./controllers/user': userRoute});
      app.init().then(() => {
        request = supertest(app);
        done();
      });
    })

    afterEach((done) => {
      app.server.close();
      UserMock.restore();
      done();
    })

    it('should create user with same formdata it received', (done) => {
      request
        .post('/signup')
        .send(formdata)
        .expect(200)
        .end(function(err, res) {
          expect(UserMockConstructor.callCount).to.equal(1);
          done();
        })
    });

    it('should create user with same formdata it received', (done) => {
      request
        .post('/api/signup')
        .send(formdata)
        .expect(200)
        .end(function(err, res) {
          expect(UserMockConstructor.callCount).to.equal(1);
          done();
        })
    });
  });

});

