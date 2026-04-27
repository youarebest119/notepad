import React, { useRef, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setDraftContent, saveNote, createNewNote } from '../store/notesSlice'
import Toolbar from '../components/Toolbar'
import { encryptNote } from '../utils/cryptoUtils'
import { saveNoteToGitHub } from '../utils/githubService'
import toast from 'react-hot-toast'

const EditorPage = ({ theme }) => {
  const dispatch = useDispatch()
  const { notes, currentNoteId, draftContent } = useSelector(state => state.notes)
  
  const editorRef = useRef(null)
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
  const [showConfirmNew, setShowConfirmNew] = useState(false)
  const [showOnlineSaveModal, setShowOnlineSaveModal] = useState(false)
  const [pin, setPin] = useState('')
  const [isSavingOnline, setIsSavingOnline] = useState(false)

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
    if (editorRef.current && draftContent !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = draftContent
    }
  }, [currentNoteId])

  useEffect(() => {
    localStorage.setItem('notepad-canvas-size', canvasSize)
  }, [canvasSize])

  const colors = [
    { name: 'Black', value: theme === 'light' ? '#000000' : '#ffffff', shortcut: 'L' },
    { name: 'Gray', value: '#666666' },
    { name: 'Blue', value: '#2563eb', shortcut: 'B' },
    { name: 'Red', value: '#dc2626', shortcut: 'R' },
    { name: 'Green', value: '#16a34a', shortcut: 'H' },
    { name: 'Purple', value: '#9333ea' },
  ]

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

  const handleFileNew = () => {
    dispatch(createNewNote())
    if (editorRef.current) editorRef.current.innerHTML = ''
    setNoteTitle('')
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

  const handleFileSaveOnline = () => {
    const currentNote = notes.find(n => n.id === currentNoteId)
    setNoteTitle(currentNote?.title || '')
    setShowOnlineSaveModal(true)
  }

  const confirmSaveOnline = async () => {
    if (!noteTitle.trim()) {
      toast.error('Please enter a title')
      return
    }
    if (!pin.trim()) {
      toast.error('Please enter a PIN to encrypt your note')
      return
    }

    setIsSavingOnline(true)
    const encrypted = encryptNote(editorRef.current.innerHTML, pin)
    
    if (encrypted) {
      const success = await saveNoteToGitHub(noteTitle, encrypted)
      if (success) {
        toast.success('Note saved online successfully!')
        setShowOnlineSaveModal(false)
        setPin('')
      } else {
        toast.error('Failed to save note online. Check your console and .env configuration.')
      }
    } else {
      toast.error('Encryption failed.')
    }
    setIsSavingOnline(false)
  }

  // Listen for global actions from Header
  useEffect(() => {
    const handleAction = (e) => {
      if (e.detail === 'save') handleFileSave()
      if (e.detail === 'save-online') handleFileSaveOnline()
      if (e.detail === 'new') setShowConfirmNew(true)
    }
    window.addEventListener('notepad-action', handleAction)
    return () => window.removeEventListener('notepad-action', handleAction)
  }, [currentNoteId, notes])

  // Keyboard shortcuts for colors
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.shiftKey) {
        const key = e.key.toLowerCase()
        let colorToApply = null

        switch (key) {
          case 'r':
            colorToApply = '#dc2626' // Red
            break
          case 'h':
            colorToApply = '#16a34a' // Green
            break
          case 'b':
            colorToApply = '#2563eb' // Blue
            break
          case 'l':
            colorToApply = theme === 'light' ? '#000000' : '#ffffff' // Black/White
            break
          default:
            break
        }

        if (colorToApply) {
          e.preventDefault()
          execAction('foreColor', colorToApply)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [theme])

  return (
    <>
      <Toolbar 
        activeTools={activeTools}
        execAction={execAction}
        fontSize={fontSize}
        handleFontSizeChange={handleFontSizeChange}
        canvasSize={canvasSize}
        setCanvasSize={setCanvasSize}
        colors={colors}
        normalizeColor={normalizeColor}
        handleFileSave={handleFileSave}
      />

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

      {showOnlineSaveModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Save Note Online (Encrypted)</h3>
            <p>Your note will be encrypted with your PIN and saved to GitHub.</p>
            <div className="modal-form">
              <label>Note Title</label>
              <input 
                type="text" 
                className="modal-input" 
                value={noteTitle} 
                onChange={(e) => setNoteTitle(e.target.value)} 
                placeholder="Enter title..."
              />
              <label>Encryption PIN</label>
              <input 
                type="password" 
                className="modal-input" 
                value={pin} 
                onChange={(e) => setPin(e.target.value)} 
                placeholder="Enter PIN..."
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowOnlineSaveModal(false)} disabled={isSavingOnline}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmSaveOnline} disabled={isSavingOnline}>
                {isSavingOnline ? 'Saving...' : 'Save Online'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default EditorPage
