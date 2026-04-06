import React, { useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loadVersion } from '../store/notesSlice'

const NotesPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { notes } = useSelector(state => state.notes)
  const sortedNotes = useMemo(() =>{
    // return [...notes].sort((a, b) => b.versions?.[0]?.timestamp - a.versions?.[0]?.timestamp).reverse()
    return [...notes].reverse();
  }, [notes])
  const [selectedNoteForHistory, setSelectedNoteForHistory] = useState(null)

  const handleRestore = (noteId, content) => {
    dispatch(loadVersion({ noteId, content }))
    navigate('/')
  }

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
            <div key={i} className="version-card" onClick={() => handleRestore(selectedNoteForHistory.id, v.content)}>
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
        <button className="btn-primary" onClick={() => navigate('/')}>Back to Editor</button>
      </div>
      <div className="notes-grid">
        {sortedNotes.length === 0 ? (
          <p className="empty-msg">No saved notes yet.</p>
        ) : (
          sortedNotes.map(note => (
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

export default NotesPage
