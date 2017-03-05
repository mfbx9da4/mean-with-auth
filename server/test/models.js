const mongoose = require('mongoose');
mongoose.promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
const {expect} = require('chai');
const sinon = require('sinon');
require('sinon-mongoose');

const User = require('../models/User');


describe('User Model', () => {
  const userdata = { email: 'test@gmail.com', password: 'root' };

  after((done) => {
    // Check we didn't create anyone!
    User.findOne({email: userdata.email}, (err, res) => {
      expect(err).to.be.null;
      expect(res).to.be.null;
      done();
    });
  })

  it('should create a new user', (done) => {
    const UserMock = sinon.mock(new User(userdata));
    const user = UserMock.object;

    UserMock
      .expects('save')
      .yields(null);

    user.save(function (err, result) {
      UserMock.verify();
      UserMock.restore();
      expect(err).to.be.null;
      done();
    });
  });

  it('should save user with gravatar', (done) => {
    const UserMock = sinon.mock(new User(userdata));
    const user = UserMock.object;

    expect(user.profile.picture).to.be.undefined;

    user.save(function (err, result) {
      expect(user.profile.picture).to.not.be.undefined;
      UserMock.verify();
      UserMock.restore();
      console.log(err);
      expect(err).to.be.null;
      user.remove(function (err) {
        done();
      });
    });
  });

  it('should return error if user is not created', (done) => {
    const UserMock = sinon.mock(new User(userdata));
    const user = UserMock.object;
    const expectedError = {
      name: 'ValidationError'
    };

    UserMock
      .expects('save')
      .yields(expectedError);

    user.save((err, result) => {
      UserMock.verify();
      UserMock.restore();
      expect(err.name).to.equal('ValidationError');
      expect(result).to.be.undefined;
      done();
    });
  });

  it('should not create a user with the unique email', (done) => {
    const UserMock = sinon.mock(new User(userdata));
    const user = UserMock.object;
    const expectedError = {
      name: 'MongoError',
      code: 11000
    };

    UserMock
      .expects('save')
      .yields(expectedError);

    user.save((err, result) => {
      UserMock.verify();
      UserMock.restore();
      expect(err.name).to.equal('MongoError');
      expect(err.code).to.equal(11000);
      expect(result).to.be.undefined;
      done();
    });
  });

  it('should find user by email', (done) => {
    const userMock = sinon.mock(User);
    const expectedUser = {
      _id: '5700a128bd97c1341d8fb365',
      email: 'test@gmail.com'
    };

    userMock
      .expects('findOne')
      .withArgs({ email: 'test@gmail.com' })
      .yields(null, expectedUser);

    User.findOne({ email: 'test@gmail.com' }, (err, result) => {
      userMock.verify();
      userMock.restore();
      expect(result.email).to.equal('test@gmail.com');
      done();
    })
  });

  it('should remove user by email', (done) => {
    const userMock = sinon.mock(User);
    const expectedResult = {
      nRemoved: 1
    };

    userMock
      .expects('remove')
      .withArgs({ email: 'test@gmail.com' })
      .yields(null, expectedResult);

    User.remove({ email: 'test@gmail.com' }, (err, result) => {
      userMock.verify();
      userMock.restore();
      expect(err).to.be.null;
      expect(result.nRemoved).to.equal(1);
      done();
    })
  });
});
