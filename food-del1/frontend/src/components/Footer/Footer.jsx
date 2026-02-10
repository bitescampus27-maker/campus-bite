import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">
            <img src={assets.logo} alt="" />
            <p>CampusBite — Your Campus, Your Cravings, Delivered Fast.
Discover delicious food from your favorite campus cafés and local eateries, delivered straight to your hostel or classroom with a single tap.</p>
            
        </div>
        <div className="footer-content-center">
            <h2>COMPANY</h2>
            <ul>
                <li>Home</li>
                <li>About us</li>
                <li>Delivery</li>
                <li>Privacy policy</li>
            </ul>
        </div>
        <div className="footer-content-right">
            <h2>GET IN TOUCH</h2>
            <ul>
                <li>+91 9569763863</li>
                <li>+91 7307886068</li>
                <li>+91 9455881202</li>
                <li>bitescampus27@gmail.com</li>
            </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">Copyright 2024 © CampusBites.com - All Right Reserved.</p>
    </div>
  )
}

export default Footer
