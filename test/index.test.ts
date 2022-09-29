import supertest from 'supertest'
import app from '../src/app'

// https://github.com/visionmedia/supertest
describe('Test Suite 1', () => {
  test('GET /healthz API endpoint', async () => {
    await supertest(app).get('/healthz').expect(200)
  })
  test('GET 404 API endpoint', async () => {
    await supertest(app).get('/notfoundendpoint').expect(404)
  })
})
