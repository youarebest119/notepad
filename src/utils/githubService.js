const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN
const GITHUB_USERNAME = import.meta.env.VITE_GITHUB_USERNAME
const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO

const API_BASE_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}`

/**
 * Saves a note to GitHub.
 * @param {string} title - The title of the note.
 * @param {string} encryptedContent - The encrypted content of the note.
 * @returns {Promise<boolean>} - True if successful.
 */
export const saveNoteToGitHub = async (title, encryptedContent) => {
  if (!GITHUB_TOKEN || !GITHUB_USERNAME || !GITHUB_REPO) {
    console.error('GitHub credentials missing in .env')
    return false
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${timestamp}.txt`
  const path = `notes/${fileName}`
  const url = `${API_BASE_URL}/contents/${path}`

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Add note: ${title}`,
        content: btoa(encryptedContent), // GitHub API requires base64 content
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('GitHub API error:', errorData)
      return false
    }

    return true
  } catch (error) {
    console.error('Error saving note to GitHub:', error)
    return false
  }
}

/**
 * Lists all notes from the GitHub repository.
 * @returns {Promise<Array>} - Array of note objects.
 */
export const listNotesFromGitHub = async () => {
  if (!GITHUB_TOKEN || !GITHUB_USERNAME || !GITHUB_REPO) {
    console.error('GitHub credentials missing in .env')
    return []
  }

  const url = `${API_BASE_URL}/contents/notes`

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) return [] // Directory might not exist yet
      console.error('GitHub API error listing notes')
      return []
    }

    const files = await response.json()
    return files.filter(file => file.name.endsWith('.txt'))
  } catch (error) {
    console.error('Error listing notes from GitHub:', error)
    return []
  }
}

/**
 * Fetches the content of a specific note from GitHub.
 * @param {string} path - The path to the note file.
 * @returns {Promise<string|null>} - The file content.
 */
export const getNoteContentFromGitHub = async (path) => {
  const url = `${API_BASE_URL}/contents/${path}`

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
      },
    })

    if (!response.ok) return null

    const data = await response.json()
    return atob(data.content) // Decode base64 content
  } catch (error) {
    console.error('Error fetching note content:', error)
    return null
  }
}
