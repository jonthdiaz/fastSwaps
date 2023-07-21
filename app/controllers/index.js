const path = require('path')
const { get_files, get_file } = require('../services/api_client')
const url = require('url');

exports.get_files = async (req, res) => {
  const data = []
  const { pathname, query } = url.parse(req.url, true);
  try {
      
    let files_data = await get_files()
    if (query.fileName !== undefined){
        files_data.files = files_data.files.filter((item) => item.includes(query.fileName));
    }
    if (files_data.files === undefined) {
      return res.json([])
    }
    for (i = 0; i < files_data.files.length; i++) {
      try {
        const file_data = {}
        file_data.file = files_data.files[i]
        file_data.lines = readFile(await get_file(file_data.file))
        data.push(file_data)
      } catch (error) {
      }
    }
    return res.json(data)
  } catch (error) {
    res.json(error)
  }
}
const readFile = (file) => {
  const results = []
  const lines = file.data.split('\n')
  lines.forEach((line, index) => {
    if (index !== 0) {
      const row = line.split(',')
      results.push({ file_name: row[0], text: row[1], number: row[2], hex: row[3] })
    }
  })
  return results
}
