import { useState } from 'react'
import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Dashboard/Home'
import Login from './pages/Auth/Login'
import SignUp from './pages/Auth/SignUp'
import Income from './pages/Dashboard/Income'
import Expense from './pages/Dashboard/Expense'
import UserProvider from './context/userContext'
import { Toaster } from 'react-hot-toast'

function App() {

  return (
    <>
      <UserProvider>
        <div>
          <BrowserRouter>
            <Routes>
              <Route path = "/" element={<Root />} />
              <Route path = "/login" element={<Login />} />
              <Route path = "/signUp" element={<SignUp />} />
              <Route path='/dashboard' element={<Home />} />
              <Route path='/income' element={<Income />} />
              <Route path='/expense' element={<Expense />} />
            </Routes>
          </BrowserRouter>
          <Toaster
            toastOptions={{
              className: "",
              style: {
                fontSize:'13px'
              },
            }}
          />
        </div>
      </UserProvider>
    </>
  )
}

export default App;

const Root = () => {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? ( <Navigate to={"/dashboard"} /> ) : ( <Navigate to="/login" /> );
}
