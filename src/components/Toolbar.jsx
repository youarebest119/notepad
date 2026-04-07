import React from 'react'

const Toolbar = ({ activeTools, execAction, fontSize, handleFontSizeChange, canvasSize, setCanvasSize, colors, normalizeColor, handleFileSave }) => {
  return (
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
            title={c.shortcut ? `${c.name} (Alt+Shift+${c.shortcut})` : c.name}
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
  )
}

export default Toolbar
