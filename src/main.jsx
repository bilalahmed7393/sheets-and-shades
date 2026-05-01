import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

import { SiteProvider } from './SiteContext'
import { CartProvider } from './CartContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SiteProvider>
      <CartProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CartProvider>
    </SiteProvider>
  </React.StrictMode>,
)
