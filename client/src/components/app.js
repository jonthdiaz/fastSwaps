import React, { useEffect, useState } from 'react'
import './app.css'

const App = () => {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch('/files/data').then((response) => response.json())
      .then((data) => setData(data))
  }, [])
  return (
    <div>
      <header class='title'>
        React Test APP
      </header>
      <div className='div-table'>
        <div className='div-table-header'>
          <div className='div-table-cell'>File Name</div>
          <div className='div-table-cell'>Text</div>
          <div className='div-table-cell'>Number</div>
          <div className='div-table-cell'>Hex</div>
        </div>
        <div className='div-table-body'>
          {data?.map(item => (
            item.lines.map(line => (
              <div className='div-table-row' key={line.file_name}>
                <div className='div-table-cell'>{line.file_name}</div>
                <div className='div-table-cell'>{line.text}</div>
                <div className='div-table-cell'>{line.number}</div>
                <div className='div-table-cell'>{line.hex}</div>
              </div>
            ))
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
