const axios = require('axios')

const base_url = 'https://echo-serv.tbxnet.com/v1/secret'
const token = 'aSuperSecretKey'

const get_files = async () => {
  try {
    const response = await axios.get(`${base_url}/files`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching API data get_files:', error)
    throw error
  }
}

const get_file = async (file_id) => {
  try {
    const response = await axios.get(`${base_url}/file/${file_id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response
  } catch (error) {
    throw error
  }
}
module.exports = {
  get_files, get_file
}
