import React, { useRef, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setDraftContent, saveNote, createNewNote } from '../store/notesSlice'
import Toolbar from '../components/Toolbar'

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
    { name: 'Black', value: theme === 'light' ? '#000000' : '#ffffff' },
    { name: 'Gray', value: '#666666' },
    { name: 'Blue', value: '#2563eb' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Green', value: '#16a34a' },
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

  // Listen for global actions from Header
  useEffect(() => {
    const handleAction = (e) => {
      if (e.detail === 'save') handleFileSave()
      if (e.detail === 'new') setShowConfirmNew(true)
    }
    window.addEventListener('notepad-action', handleAction)
    return () => window.removeEventListener('notepad-action', handleAction)
  }, [currentNoteId, notes])

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
    </>
  )
}

export default EditorPage
