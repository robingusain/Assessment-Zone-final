import React from 'react'
import Login from './components/Login/Login'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import EditorPage from './components/EditorPage/EditorPage'
import { Toaster } from 'react-hot-toast'

const App = () => {
  return (
    <>
    <div>
      <Toaster position='top-right'
      toastOptions={{
        success:{
          style: {
            background: '#6940d1',
            color: "#fff"    
          }
        },
        error: {
          style: {
            background: '#6940d1',
            color: "#fff" 
          }
        }
      }}
      ></Toaster>
    </div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login />}></Route>
          <Route path='/editor/:roomId' element={<EditorPage />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
