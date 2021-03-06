const request = require('supertest');
const app = require('../app.js');

describe('App Tests', () => {
  before((done) => {
    app.init().then(done);
  })

  after(() => {
    app.server.close();
  })

  describe('GET /', () => {
    it('should return 200 OK', (done) => {
      request(app)
        .get('/')
        .expect(200, (err, res) => {
          done();
        });
    });
  });

  describe('GET /login', () => {
    it('should return 200 OK', (done) => {
      request(app)
        .get('/login')
        .expect(200, (err, res) => {
          done();
        });
    });
  });

  describe('GET /signup', () => {
    it('should return 200 OK', (done) => {
      request(app)
        .get('/signup')
        .expect(200, (err, res) => {
          console.log(res.error);
          done();
        });
    });
  });

  describe('GET /random-url', () => {
    it('should return 404', (done) => {
      request(app)
        .get('/random-url')
        .expect(404, done);
    });
  });

});

