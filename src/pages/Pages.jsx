import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { HomePage } from "./HomePage"
import { Admin } from './Admin';
import { LeaderBoard } from './LeaderBoard';

export const Pages = () => {

    const location = useLocation();

    return (
        <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path='/leaderboard' element={<LeaderBoard />} />
        {/* <Route path='/blocked' element={<div style={{color: #f1f1f1}}>You have been blocked for using offensive name  </div>} /> */}
      </Routes>
    )
}
