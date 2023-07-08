const path = require('path');

exports.get_files =(req, res)=>{
  const data = {
    name: 'John Doe',
    age: 30,
    occupation: 'Developer'
  };
  res.json(data);
}
