import React from 'react'
import './App.css';
import Homepage from './components/Homepage';
import { Provider } from "./components/ui/provider"
import ChatPage from './components/ChatPage';
import { Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Provider>
      <div
      className='App'>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/chats" element={<ChatPage />} />
        </Routes>
      </div>
      
    </Provider>
  )
}

export default App
