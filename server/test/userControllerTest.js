const supertest = require('supertest');
const superagent = require('superagent');
const mongoose = require('mongoose');
const {expect} = require('chai');
const sinon = require('sinon');
const express = require('express');
require('sinon-mongoose');
const proxyquire = require('proxyquire');
const User = require('../models/User');

const routeNames = require('../config/routeNames');

const APP_URL = 'http://localhost:3003';
const LOGIN_URL = APP_URL + routeNames.login;
const API_LOGIN_URL = APP_URL + routeNames.api.login;
const HOME_URL = APP_URL + routeNames.home;


function login(request, userdata, done) {
  console.log('start login');
  request
    .post(LOGIN_URL)
    .send(userdata)
    .end((err, res) => {
      console.log('logged in');
      expect(res.redirects).to.eql([HOME_URL]);
      expect(res.status).to.equal(200);
      done();
    });
}

function injectAppWithUserMock(UserMock, done) {
  const userRoute = proxyquire('../controllers/user.js', {
    '../models/User': UserMock
  });
  let app = proxyquire('../app.js', {'./controllers/user': userRoute});
  app.init().then(() => {
    done(app, superagent.agent());
  });
}


describe('user tests', () => {

  const formdata = {
    email: 'te.st@gmail.com',
    password: 'asdf',
    confirmPassword: 'asdf'
  };

  const userdata = {
    email: formdata.email,
    password: formdata.password
  };

  describe('With signed in user', () => {
    let app;
    let user1;
    let request;

    after((done) => {
      user1.remove((err, res) => {
        app.server.close();
        done();
      })
    });

    before((done) => {
      user1 = new User(userdata);
      user1.save();

      app = require('../app.js');
      app
        .init()
        .then(() => {
          request = superagent.agent();
          login(request, userdata, done);
        });
    });

    it('should redirect when logged in', (done) => {
      request
        .get(LOGIN_URL)
        .end((err, res) => {
          expect(res.redirects).to.eql([HOME_URL]);
          expect(res.status).to.equal(200);
          done();
        })
    });

    it('should redirect when logged in', (done) => {
      request
        .post(API_LOGIN_URL)
        .send(userdata)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.success).to.be.true;
          expect(res.body.data.email).to.equal(userdata.email);
          done();
        });
    });
  });

  describe(`POST ${APP_URL + routeNames.api.userUpdate}`, () => {
    let app, request;

    after(done => {
      User.update.restore();
      app.server.close();
      done();
    })

    it('should update user', (done) => {
      user1 = User.create(userdata);
      let save_stub = sinon.stub(user1, 'save', (fn)=>{fn(null)});
      let update = {profile: {name: 'asdf'}};
      update_stub = sinon.stub(User, 'update', (conditions, doc, options, fn) => {
        console.log('conditions');
        console.log(conditions);
        expect(conditions).to.eql({_id: user1._id.toString()})
        expect(doc).to.eql(update)
        user1.profile = update.profile;
        fn(null, user1);
      });


      injectAppWithUserMock(User, (_app, request) => {
        app = _app;
        let url = app.get('server_url') + routeNames.api.userUpdate;
        url = url.replace(':id', user1._id);
        console.log('user1id');
        console.log(user1._id);
        login(request, userdata, () => {
          console.log('got here');
          request
            .post(url)
            .send(update)
            .end(function(err, res) {
              expect(err).to.be.null;
              expect(res.status).to.be.equal(200);
              expect(res.body.success).to.be.true;
              expect(res.body.data.email).to.equal(userdata.email);
              expect(res.body.data.profile.name).to.equal(update.profile.name);
              done();
            });
        })
      });

    });
  });


  describe('POST /signup', () => {
    let UserMock, UserMockConstructor, user1, app;

    beforeEach(done => {
      user1 = User.create(userdata);
      let save_stub = sinon.stub(user1, 'save', (fn)=>{fn(null)});

      // User mock expects find with same email
      UserMock = sinon.mock(User);
      UserMock
        .expects('create')
        .withArgs(userdata)
        .once()
        .returns(user1)
      UserMock
        .expects('findOne')
        .withArgs({email: userdata.email})
        .yields(null)

      done();

    })

    afterEach((done) => {
      app.server.close();
      UserMock.verify();
      UserMock.restore();
      done();
    })

    it('should create user with same formdata it received', (done) => {
      UserMock
        .expects('findOne')
        .yields(null, user1);

      injectAppWithUserMock(UserMock, (_app, request) => {
        app = _app;
        request
          .post(APP_URL + routeNames.signup)
          .send(formdata)
          .end(function(err, res) {
            expect(err).to.be.null;
            expect(res.redirects).to.be.eql([HOME_URL]);
            done();
          })
      })
    });

    it('/api/signup should create user with same formdata it received', (done) => {
      injectAppWithUserMock(UserMock, (_app, request) => {
        app = _app;
        request
          .post(APP_URL + routeNames.api.signup)
          .send(formdata)
          .end(function(err, res) {
            expect(res.status).to.be.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data.email).to.equal(userdata.email);
            expect(err).to.be.null;
            done();
          })
      });
    });
  });

});

