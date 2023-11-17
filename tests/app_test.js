process.env.PORT = 4000
process.env.NODE_ENV = 'test'
const baseUrl = `http://localhost:${process.env.PORT}`
const request = require('request')
const assert = require('assert')
const httpStatus = require('http-status-codes')
const server = require('../app/app')
const { expect } = require('chai')

describe('Test app.js file', () => {
  it('Should return status 400 value invalid', (done) => {
    request.post(`${baseUrl}/api/transaction`, (error, response, body) => {
      const result = JSON.parse(body)
      assert.strictEqual(result.error, "Invalid parameter value")
      assert.strictEqual(response.statusCode, httpStatus.BAD_REQUEST)
      done()
    })
  })
  it('Should return status 400 to address invalid', (done) => {
      const options = {
        url: `${baseUrl}/api/transaction`,
        method: 'POST',
        json: true,
        body: {
          value: 10, // replace with your actual parameter name and value
        }
      };
    request(options, (error, response, body) => {
      assert.strictEqual(body.error, "Invalid parameter address")
      assert.strictEqual(response.statusCode, httpStatus.BAD_REQUEST)
      done()
    })
  })

  it('Should return status 201 transaction created', (done) => {
      const options = {
        url: `${baseUrl}/api/transaction`,
        method: 'POST',
        json: true,
        body: {
          value: 10, // replace with your actual parameter name and value
          toAddress: "0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C"
        }
      };
    request(options, (error, response, body) => {
       expect(body.address).to.match(/^0x[a-fA-F0-9]{40}$/);
      assert.strictEqual(response.statusCode, httpStatus.CREATED)
      done()
    })
  })
})
