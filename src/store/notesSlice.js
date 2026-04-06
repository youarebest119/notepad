import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

const loadState = () => {
  try {
    const serializedState = localStorage.getItem('notepad_notes')
    if (serializedState === null) {
      return undefined
    }
    return JSON.parse(serializedState)
  } catch (err) {
    return undefined
  }
}

const persistedState = loadState()

const initialState = persistedState || {
  notes: [],
  currentNoteId: null,
  draftContent: '',
}

export const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setDraftContent: (state, action) => {
      state.draftContent = action.payload
    },
    saveNote: (state, action) => {
      const { title, content } = action.payload
      const timestamp = new Date().toISOString()
      
      let note = state.notes.find(n => n.id === state.currentNoteId)
      
      if (note) {
        // Update existing note with a new version
        note.versions.unshift({ content, timestamp })
        note.title = title || note.title
      } else {
        // Create new note
        const newId = uuidv4()
        state.notes.push({
          id: newId,
          title: title || 'Untitled Note',
          versions: [{ content, timestamp }]
        })
        state.currentNoteId = newId
      }
    },
    loadVersion: (state, action) => {
      const { noteId, content } = action.payload
      state.currentNoteId = noteId
      state.draftContent = content
    },
    createNewNote: (state) => {
      state.currentNoteId = null
      state.draftContent = ''
    }
  },
})

export const { setDraftContent, saveNote, loadVersion, createNewNote } = notesSlice.actions
export default notesSlice.reducer
