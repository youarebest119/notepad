import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const Header = ({ theme, toggleTheme }) => {
  const [activeMenu, setActiveMenu] = useState(null)
  const location = useLocation()

  const menuItems = {
    File: [
      { label: 'New', to: '/', action: 'new' }, // Special case for new note
      { label: 'Save', action: 'save' },
      { label: 'Saved Notes', to: '/notes' },
    ],
    View: [
      { label: 'Toggle Dark Mode', action: toggleTheme },
      { label: 'Editor', to: '/' },
      { label: 'All Notes', to: '/notes' },
    ],
  }

  return (
    <header className="notepad-header">
      <div className="menu-bar">
        {Object.entries(menuItems).map(([key, items]) => (
          <div 
            key={key} 
            className="menu-group"
            onClick={() => setActiveMenu(activeMenu === key ? null : key)}
          >
            <div className="menu-item">{key}</div>
            <div className={`dropdown-content ${activeMenu === key ? 'show' : ''}`}>
              {items.map((item) => {
                const handleClick = (e) => {
                  if (item.action) {
                    if (typeof item.action === 'function') {
                      item.action()
                    } else {
                      // Dispatches custom event for the EditorPage listener
                      window.dispatchEvent(new CustomEvent('notepad-action', { detail: item.action }))
                    }
                  }
                  setActiveMenu(null)
                }

                return item.to ? (
                  <Link 
                    key={item.label} 
                    to={item.to} 
                    className="dropdown-item" 
                    onClick={handleClick}
                  >
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <div key={item.label} className="dropdown-item" onClick={(e) => {
                    e.stopPropagation()
                    handleClick(e)
                  }}>
                    <span>{item.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="theme-toggle" onClick={toggleTheme}>
        {theme === 'light' ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
        )}
        <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
      </div>
    </header>
  )
}

export default Header
