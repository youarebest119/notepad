import React, { useState, Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'

// Lazy loading pages for optimization
const EditorPage = lazy(() => import('./pages/EditorPage'))
const NotesPage = lazy(() => import('./pages/NotesPage'))

const Application = () => {
  const [theme, setTheme] = useState('light')

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.body.setAttribute('data-theme', newTheme)
  }

  return (
    <div className="notepad-app">
      <Header theme={theme} toggleTheme={toggleTheme} />
      
      <main className="app-main">
        <Suspense fallback={<div className="loading-screen">Loading...</div>}>
          <Routes>
            <Route path="/" element={<EditorPage theme={theme} />} />
            <Route path="/notes" element={<NotesPage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}

export default Application
