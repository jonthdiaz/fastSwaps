process.env.PORT = 4000
process.env.NODE_ENV = 'test'
const baseUrl = `http://localhost:${process.env.PORT}`
const mockUrl = 'https://echo-serv.tbxnet.com/v1/secret'
const axios = require('axios')
const MockAdapter = require('axios-mock-adapter')
const request = require('request')
const assert = require('assert')
const httpStatus = require('http-status-codes')
const server = require('../app/app')
const { expect } = require('chai')

describe('Test app.js file', () => {
  it('Should return status 200 ok', (done) => {
    const mock = new MockAdapter(axios)
    mock.onGet(`${mockUrl}/files`).reply(200, { files: [] })
    request.get(`${baseUrl}/files/data`, (error, response, body) => {
      const result = JSON.parse(body)
      assert.strictEqual(result.length, 0)
      assert.strictEqual(response.statusCode, httpStatus.OK)
      done()
    })
  })

  it('Should return status 200 when the body does not have the key files', (done) => {
    const mock = new MockAdapter(axios)
    mock.onGet(`${mockUrl}/files`).reply(httpStatus.OK, {})
    request.get(`${baseUrl}/files/data`, (error, response, body) => {
      assert.strictEqual(response.statusCode, httpStatus.OK)
      done()
    })
  })

  it('Should return the list of files found', (done) => {
    const mock = new MockAdapter(axios)
    mock.onGet(`${mockUrl}/files`).reply(httpStatus.OK, { files: ['test1.csv', 'test2.csv'] })
    mock.onGet(`${mockUrl}/file/test1.csv`).reply(httpStatus.OK, '')
    mock.onGet(`${mockUrl}/file/test2.csv`).reply(httpStatus.OK, '')
    request.get(`${baseUrl}/files/data`, (error, response, body) => {
      const result = JSON.parse(body)
      assert.strictEqual(result.length, 2)
      assert.strictEqual(response.statusCode, httpStatus.OK)
      result.forEach((item) => {
        expect(['test2.csv', 'test1.csv']).to.include.oneOf([item.file])
      })
      done()
    })
  })

  it('Should return the list with the lines items', (done) => {
    const mock = new MockAdapter(axios)
    mock.onGet(`${mockUrl}/files`).reply(httpStatus.OK, { files: ['test1.csv'] })
    mock.onGet(`${mockUrl}/file/test1.csv`).reply(httpStatus.OK, 'file,text,number,hex\ntest.csv,test,123,9922')
    request.get(`${baseUrl}/files/data`, (error, response, body) => {
      const result = JSON.parse(body)
      assert.strictEqual(result.length, 1)
      assert.strictEqual(result[0].lines[0].file_name, 'test.csv')
      assert.strictEqual(result[0].lines[0].text, 'test')
      assert.strictEqual(result[0].lines[0].number, '123')
      assert.strictEqual(result[0].lines[0].hex, '9922')
      assert.strictEqual(response.statusCode, httpStatus.OK)
      result.forEach((item) => {
        expect(['test1.csv']).to.include.oneOf([item.file])
      })
      done()
    })
  })
  it('Should filter by specific file', (done) => {
    const mock = new MockAdapter(axios)
    mock.onGet(`${mockUrl}/files`).reply(httpStatus.OK, { files: ['test1.csv', "test2.csv"] })
    mock.onGet(`${mockUrl}/file/test1.csv`).reply(httpStatus.OK, 'file,text,number,hex\ntest.csv,test,123,9922')
    request.get(`${baseUrl}/files/data?fileName=test1`, (error, response, body) => {
      const result = JSON.parse(body)
      assert.strictEqual(result.length, 1)
      assert.strictEqual(result[0].lines[0].file_name, 'test.csv')
      assert.strictEqual(result[0].lines[0].text, 'test')
      assert.strictEqual(result[0].lines[0].number, '123')
      assert.strictEqual(result[0].lines[0].hex, '9922')
      assert.strictEqual(response.statusCode, httpStatus.OK)
      result.forEach((item) => {
        expect(['test1.csv']).to.include.oneOf([item.file])
      })
      done()
    })
  })
})
