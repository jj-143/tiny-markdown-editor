import React, { useEffect, useState } from "react"
import ReactDOM from "react-dom"

ReactDOM.render(<App />, document.getElementById("root"))

import Editor from "../src"

function App() {
  const [rawMD, setRawMD] = useState("")

  useEffect(() => {
    let editor = Editor.render(document.getElementById("editor"))

    editor.onInput(t => {
      setRawMD(editor.getRaw())
    })
  }, [])

  return (
    <div>
      <h1>Tiny Markdown Editor</h1>
      <h2>supporting syntax:</h2>
      <ul>
        <li>
          code - <code>`code`</code>
        </li>
      </ul>

      <h3>editor</h3>
      <div id="editor" />

      <h3>raw markdown</h3>
      <div className="rawView">
        {rawMD.split("\n").map((it, idx) => {
          return it === "" ? <br key={idx}></br> : <div key={idx}>{it}</div>
        })}
      </div>
    </div>
  )
}
