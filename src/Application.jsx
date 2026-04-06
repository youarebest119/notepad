import React, { useRef, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  setCurrentView, 
  setDraftContent, 
  saveNote, 
  loadVersion, 
  createNewNote 
} from './store/notesSlice'

const Application = () => {
  const dispatch = useDispatch()
  const { notes, currentNoteId, currentView, draftContent } = useSelector(state => state.notes)
  
  const editorRef = useRef(null)
  const fileInputRef = useRef(null)
  
  const [theme, setTheme] = useState('light')
  const [fontSize, setFontSize] = useState('3')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [noteTitle, setNoteTitle] = useState('')
  const [canvasSize, setCanvasSize] = useState(() => localStorage.getItem('notepad-canvas-size') || 'medium')
  const [activeTools, setActiveTools] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    justifyLeft: true,
    justifyCenter: false,
    justifyRight: false,
    insertUnorderedList: false,
    insertOrderedList: false,
    color: '#000000',
  })
  const [activeMenu, setActiveMenu] = useState(null)
  const [showConfirmNew, setShowConfirmNew] = useState(false)
  const [selectedNoteForHistory, setSelectedNoteForHistory] = useState(null)

  const execAction = (command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    updateActiveTools()
  }

  const updateActiveTools = () => {
    setActiveTools({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikethrough: document.queryCommandState('strikethrough'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      color: document.queryCommandValue('foreColor'),
    })
    if (editorRef.current) {
      dispatch(setDraftContent(editorRef.current.innerHTML))
    }
  }

  useEffect(() => {
    document.addEventListener('selectionchange', updateActiveTools)
    return () => document.removeEventListener('selectionchange', updateActiveTools)
  }, [])

  useEffect(() => {
    if (currentView === 'editor' && editorRef.current && draftContent !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = draftContent
    }
  }, [currentNoteId, currentView])

  useEffect(() => {
    localStorage.setItem('notepad-canvas-size', canvasSize)
  }, [canvasSize])

  const colors = [
    { name: 'Black', value: theme === 'light' ? '#000000' : '#ffffff' },
    { name: 'Gray', value: '#666666' },
    { name: 'Blue', value: '#2563eb' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Purple', value: '#9333ea' },
  ]

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.shiftKey) {
        const key = e.key.toLowerCase()
        if (key === 'b') {
          e.preventDefault()
          execAction('foreColor', '#2563eb')
        } else if (key === 'r') {
          e.preventDefault()
          execAction('foreColor', '#dc2626')
        } else if (key === 'h') {
          e.preventDefault()
          execAction('foreColor', '#16a34a')
        } else if (key === 'l') {
          e.preventDefault()
          execAction('foreColor', theme === 'light' ? '#000000' : '#ffffff')
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [theme])

  const normalizeColor = (color) => {
    if (!color) return ''
    if (color.startsWith('rgb')) {
      const match = color.match(/\d+/g)
      if (match) {
        return `#${match.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('')}`.toLowerCase()
      }
    }
    return color.toLowerCase()
  }

  const handleFontSizeChange = (e) => {
    const size = e.target.value
    setFontSize(size)
    execAction('fontSize', size)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.body.setAttribute('data-theme', newTheme)
  }

  const handleFileNew = () => {
    dispatch(createNewNote())
    if (editorRef.current) editorRef.current.innerHTML = ''
    setShowConfirmNew(false)
  }

  const handleFileSave = () => {
    const currentNote = notes.find(n => n.id === currentNoteId)
    setNoteTitle(currentNote?.title || '')
    setShowSaveModal(true)
  }

  const confirmSave = () => {
    dispatch(saveNote({ 
      title: noteTitle || 'Untitled Note', 
      content: editorRef.current.innerHTML 
    }))
    setShowSaveModal(false)
  }

  const insertTable = () => {
    const tableHTML = `
      <table class="editor-table">
        <tbody>
          ${Array(3).fill('<tr>' + Array(3).fill('<td>&nbsp;</td>').join('') + '</tr>').join('')}
        </tbody>
      </table><p>&nbsp;</p>
    `;
    execAction('insertHTML', tableHTML);
  }

  const insertColumns = () => {
    const selection = window.getSelection().toString() || 'Column text...';
    const columnsHTML = `
      <div class="columns-container">
        <div class="column">${selection}</div>
        <div class="column">Column 2 text...</div>
      </div><p>&nbsp;</p>
    `;
    execAction('insertHTML', columnsHTML);
  }


  const menuItems = {
    File: [
      { label: 'New', action: () => setShowConfirmNew(true), shortcut: 'Ctrl+N' },
      { label: 'Save', action: handleFileSave, shortcut: 'Ctrl+S' },
      { label: 'Saved Notes', action: () => dispatch(setCurrentView('history')) },
    ],
    Edit: [
      { label: 'Undo', action: () => execAction('undo'), shortcut: 'Ctrl+Z' },
      { label: 'Redo', action: () => execAction('redo'), shortcut: 'Ctrl+Y' },
    ],
    View: [
      { label: 'Toggle Dark Mode', action: toggleTheme },
      { label: 'Editor', action: () => dispatch(setCurrentView('editor')) },
      { label: 'All Notes', action: () => dispatch(setCurrentView('history')) },
    ],
  }

  const renderHistoryView = () => {
    if (selectedNoteForHistory) {
      return (
        <div className="history-view">
          <div className="history-header">
            <button className="btn-back" onClick={() => setSelectedNoteForHistory(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
              Back to Notes
            </button>
            <h2>{selectedNoteForHistory.title} - Version History</h2>
          </div>
          <div className="version-list">
            {selectedNoteForHistory.versions.map((v, i) => (
              <div key={i} className="version-card" onClick={() => dispatch(loadVersion({ noteId: selectedNoteForHistory.id, content: v.content }))}>
                <div className="version-info">
                  <span className="version-date">{new Date(v.timestamp).toLocaleString()}</span>
                  <span className="version-preview">{v.content.replace(/<[^>]*>/g, '').substring(0, 100)}...</span>
                </div>
                <button className="btn-restore">Restore</button>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="history-view">
        <div className="history-header">
          <h2>Your Saved Notes</h2>
          <button className="btn-primary" onClick={() => dispatch(setCurrentView('editor'))}>Back to Editor</button>
        </div>
        <div className="notes-grid">
          {notes.length === 0 ? (
            <p className="empty-msg">No saved notes yet.</p>
          ) : (
            notes.map(note => (
              <div key={note.id} className="note-card" onClick={() => setSelectedNoteForHistory(note)}>
                <h3>{note.title}</h3>
                <p>{note.versions.length} versions</p>
                <small>Last edited: {new Date(note.versions[0].timestamp).toLocaleDateString()}</small>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="notepad-app">
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
                {items.map((item) => (
                  <div key={item.label} className="dropdown-item" onClick={(e) => {
                    e.stopPropagation()
                    item.action()
                    setActiveMenu(null)
                  }}>
                    <span>{item.label}</span>
                    {item.shortcut && <small style={{ opacity: 0.5, marginLeft: '1rem' }}>{item.shortcut}</small>}
                  </div>
                ))}
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

      {currentView === 'editor' ? (
        <>
          <div className="notepad-toolbar">
            <div className="tool-group">
              <button className="tool-button" onClick={() => execAction('undo')} title="Undo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
              </button>
              <button className="tool-button" onClick={() => execAction('redo')} title="Redo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"/></svg>
              </button>
            </div>

            <div className="tool-group">
              <button className={`tool-button ${activeTools.bold ? 'active' : ''}`} onClick={() => execAction('bold')} title="Bold">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>
              </button>
              <button className={`tool-button ${activeTools.italic ? 'active' : ''}`} onClick={() => execAction('italic')} title="Italic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>
              </button>
              <button className={`tool-button ${activeTools.underline ? 'active' : ''}`} onClick={() => execAction('underline')} title="Underline">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>
              </button>
            </div>

            <div className="tool-group">
              <button className={`tool-button ${activeTools.justifyLeft ? 'active' : ''}`} onClick={() => execAction('justifyLeft')} title="Align Left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
              </button>
              <button className={`tool-button ${activeTools.justifyCenter ? 'active' : ''}`} onClick={() => execAction('justifyCenter')} title="Align Center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg>
              </button>
              <button className={`tool-button ${activeTools.justifyRight ? 'active' : ''}`} onClick={() => execAction('justifyRight')} title="Align Right">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>
              </button>
            </div>

            <div className="tool-group">
              <button className={`tool-button ${activeTools.insertUnorderedList ? 'active' : ''}`} onClick={() => execAction('insertUnorderedList')} title="Bullet List">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              </button>
              <button className={`tool-button ${activeTools.insertOrderedList ? 'active' : ''}`} onClick={() => execAction('insertOrderedList')} title="Numbered List">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>
              </button>
            </div>

            <div className="tool-group">
              <select className="font-size-select" value={fontSize} onChange={handleFontSizeChange}>
                <option value="1">Small</option>
                <option value="3">Normal</option>
                <option value="5">Large</option>
                <option value="7">Extra</option>
              </select>
            </div>

            <div className="tool-group">
              <select className="size-select" value={canvasSize} onChange={(e) => setCanvasSize(e.target.value)} title="Canvas Size">
                <option value="small">Narrow</option>
                <option value="medium">Normal</option>
                <option value="large">Wide</option>
              </select>
            </div>

            <div className="tool-group colors">
              {colors.map(c => (
                <button 
                  key={c.name} 
                  className={`color-dot ${normalizeColor(activeTools.color) === c.value.toLowerCase() ? 'active' : ''}`} 
                  style={{ background: c.value }} 
                  onClick={() => execAction('foreColor', c.value)}
                  title={c.name}
                />
              ))}
            </div>

            <div className="tool-group">
              <button className="btn btn-save" onClick={handleFileSave}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Save
              </button>
            </div>
          </div>

            <div className="notepad-editor-container">
            <div
              ref={editorRef}
              className={`notepad-editor canvas-${canvasSize}`}
              contentEditable="true"
              data-placeholder="Start typing your amazing ideas..."
              onInput={updateActiveTools}
              onKeyUp={updateActiveTools}
              onMouseUp={updateActiveTools}
            ></div>
          </div>
        </>
      ) : renderHistoryView()}

      {showSaveModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Save Note</h3>
            <p>Give your note a title to save it to your collection.</p>
            <input 
              type="text" 
              className="modal-input" 
              value={noteTitle} 
              onChange={(e) => setNoteTitle(e.target.value)} 
              placeholder="Enter title..."
              onFocus={(e) => e.target.select()}
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowSaveModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmSave}>Save Note</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmNew && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Start New Note?</h3>
            <p>Ensure you've saved your current work. This will clear the editor.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowConfirmNew(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleFileNew}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Application
