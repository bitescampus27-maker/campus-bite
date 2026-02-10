import React from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'

const Navbar = () => {
  return (
    <header className='navbar'>
      <img className='logo' src={assets.logo} alt="" />

      <div className="navbar-right">
        <img className='profile' src={assets.profile_image} alt="profile" />
      </div>
    </header>
  )
}

export default Navbar
