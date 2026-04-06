import { configureStore } from '@reduxjs/toolkit'
import notesReducer from './notesSlice'

export const store = configureStore({
  reducer: {
    notes: notesReducer,
  },
})

store.subscribe(() => {
  try {
    const state = store.getState().notes
    const serializedState = JSON.stringify(state)
    localStorage.setItem('notepad_notes', serializedState)
  } catch (err) {
    // Ignore write errors
  }
})
