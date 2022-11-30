const supertest = require('supertest')
const app = require('../app')

// https://github.com/visionmedia/supertest
describe('Unit Test Suite', () => {
  it('GET /healthz API endpoint', (done) => {
    supertest(app)
      .get('/health')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        return done()
      })
  })
  it('GET 404 API endpoint', (done) => {
    supertest(app)
      .get('/notfoundendpoint')
      .expect(404)
      .end((err, res) => {
        if (err) return done(err)
        return done()
      })
  })
})
