const supertest = require('supertest');
const superagent = require('superagent');
const mongoose = require('mongoose');
const {expect} = require('chai');
const sinon = require('sinon');
const express = require('express');
require('sinon-mongoose');
const proxyquire = require('proxyquire');
const User = require('../models/User');

const formdata = {
  email: 'te.st@gmail.com',
  password: 'asdf',
  confirmPassword: 'asdf'
};

const userdata = {
  email: formdata.email,
  password: formdata.password
};

const TEST_URL = 'http://localhost:3003'
const LOGIN_URL = TEST_URL + '/login';
const HOME_URL = TEST_URL + '/';
const ACCOUNT_URL = TEST_URL + '/account';
const UPDATE_ACCOUNT_URL = TEST_URL + '/account/profile';


describe.only('With signed in user', () => {
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
  let UserMock;
  let app;

  after((done) => {
    app.server.close();
    UserMock.restore();
    done();
  })

  it('should create user with same formdata it received', (done) => {
    // User mock expects find with same email
    UserMock = sinon.mock(User);
    UserMock
      .expects('findOne')
      .withArgs({email: userdata.email})
      .yields(null, new User(userdata));

    // User mock expects constructor with same userdata
    const UserMockConstructor = sinon.stub();
    UserMockConstructor.withArgs(userdata).returns(UserMock);
    UserMockConstructor.throws();

    const userRoute = proxyquire('../controllers/user.js', {
      '../models/User': UserMockConstructor
    });
    app = proxyquire('../app.js', {'./controllers/user': userRoute});
    app
      .init()
      .then(() => {
        const request = supertest(app);

        request
          .post('/signup')
          .send(formdata)
          .expect(200)
          .end(function(err, res) {
            expect(UserMockConstructor.calledOnce).to.be.true;
            done();
          })

      })
  });
});
