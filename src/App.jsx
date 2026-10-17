import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom';
import Home from './SubComponents/Home/Home';
import FixedNav from './SubComponents/FixedNavigationComponent/Nav';
import About from './SubComponents/About/About';
import NotFound from './SubComponents/NotFound/NotFound';

function App() {
  return (
    <div className="app">
      <div className="topFixedBar">
        <FixedNav />
      </div>

      <div className="restSection">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App
