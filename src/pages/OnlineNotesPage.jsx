import React, { useState, useEffect } from 'react'
import { listNotesFromGitHub, getNoteContentFromGitHub } from '../utils/githubService'
import { decryptNote } from '../utils/cryptoUtils'
import toast from 'react-hot-toast'

const OnlineNotesPage = () => {
  const [notes, setNotes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedNote, setSelectedNote] = useState(null)
  const [pin, setPin] = useState('')
  const [showDecryptModal, setShowDecryptModal] = useState(false)
  const [decryptedContent, setDecryptedContent] = useState(null)
  const [isDecrypting, setIsDecrypting] = useState(false)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    setIsLoading(true)
    const githubNotes = await listNotesFromGitHub()
    setNotes(githubNotes)
    setIsLoading(false)
  }

  const handleNoteClick = (note) => {
    setSelectedNote(note)
    setShowDecryptModal(true)
    setPin('')
    setDecryptedContent(null)
  }

  const handleDecrypt = async () => {
    if (!pin.trim()) {
      toast.error('Please enter the PIN')
      return
    }

    setIsDecrypting(true)
    const encryptedContent = await getNoteContentFromGitHub(selectedNote.path)
    
    if (encryptedContent) {
      const decrypted = decryptNote(encryptedContent, pin)
      if (decrypted) {
        setDecryptedContent(decrypted)
        toast.success('Note decrypted successfully!')
      } else {
        toast.error('Invalid PIN or decryption failed.')
      }
    } else {
      toast.error('Failed to fetch note content from GitHub.')
    }
    setIsDecrypting(false)
  }

  return (
    <div className="notes-page">
      <div className="notes-header">
        <h1>Online Notes (GitHub)</h1>
        <button className="btn btn-secondary" onClick={fetchNotes} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {isLoading ? (
        <div className="loading-state">Loading notes from GitHub...</div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <p>No online notes found. Start by saving a note online!</p>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <div key={note.sha} className="note-card" onClick={() => handleNoteClick(note)}>
              <div className="note-card-header">
                <h3>{note.name.replace(/_[0-9-T]+.txt$/, '').replace(/_/g, ' ')}</h3>
              </div>
              <div className="note-card-body">
                <p className="note-meta">File: {note.name}</p>
                <p className="note-meta">Size: {(note.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDecryptModal && (
        <div className="modal-overlay">
          <div className="confirm-modal wide-modal">
            <h3>{selectedNote.name.replace(/_[0-9-T]+.txt$/, '').replace(/_/g, ' ')}</h3>
            
            {!decryptedContent ? (
              <>
                <p>This note is encrypted. Please enter the PIN to decrypt it.</p>
                <div className="modal-form">
                  <input 
                    type="password" 
                    className="modal-input" 
                    value={pin} 
                    onChange={(e) => setPin(e.target.value)} 
                    placeholder="Enter PIN..."
                    autoFocus
                  />
                </div>
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setShowDecryptModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleDecrypt} disabled={isDecrypting}>
                    {isDecrypting ? 'Decrypting...' : 'Decrypt Note'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="decrypted-content-preview" dangerouslySetInnerHTML={{ __html: decryptedContent }}></div>
                <div className="modal-actions">
                  <button className="btn btn-primary" onClick={() => setShowDecryptModal(false)}>Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default OnlineNotesPage
