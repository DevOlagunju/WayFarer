const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/index');

describe('WayFarer API Basic Tests', () => {
  describe('GET /', () => {
    it('should return welcome message', (done) => {
      request(app)
        .get('/')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.status).to.equal('success');
          expect(res.body.data).to.have.property('message');
          expect(res.body.data.message).to.equal('Welcome to WayFarer API');
          done();
        });
    });
  });

  describe('GET /api/v1', () => {
    it('should return API v1 message', (done) => {
      request(app)
        .get('/api/v1')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.status).to.equal('success');
          expect(res.body.data).to.have.property('message');
          done();
        });
    });
  });

  describe('GET /non-existent-route', () => {
    it('should return 404 for non-existent routes', (done) => {
      request(app)
        .get('/non-existent-route')
        .expect(404)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.status).to.equal('error');
          expect(res.body.error).to.equal('Route not found');
          done();
        });
    });
  });
});
