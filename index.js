import React, { useLayoutEffect, useRef, useState } from "react"
import ReactDOM from "react-dom"

ReactDOM.render(<App />, document.getElementById("root"))

function App() {
  return (
    <div>
      <h1>Tiny Markdown Editor</h1>
      <h2>supporting syntax:</h2>
      <ul>
        <li>
          code - <code>`code`</code>
        </li>
      </ul>
      <TextField />
    </div>
  )
}

function TextField() {
  const editorRef = useRef()
  const onKeyDown = e => {
    if (e.key === "`") {
      let selection = window.getSelection()
      let node = selection.baseNode
      let text = node.textContent
      let codeEnd = selection.focusOffset
      let start = node.textContent.substring(0, codeEnd).lastIndexOf(`\``)

      if (start === 0 || node.textContent[start - 1] === " ") {
        e.preventDefault()
        let parent = node.parentElement
        let pre = document.createTextNode(text.substring(0, start))
        let post = document.createTextNode(text.substring(selection.anchorOffset + 1))
        let code = document.createElement("span")

        code.className = "code"
        code.textContent = text.substring(start + 1, codeEnd)

        node.replaceWith(post)
        parent.insertBefore(pre, post)
        parent.insertBefore(code, post)

        // temporary trick to prevent the span spanning
        let after = document.createTextNode("")
        after.textContent = " "
        parent.insertBefore(after, post)

        let sel = window.getSelection()
        let range = document.createRange()
        sel.removeAllRanges()
        range.setStart(after, 1)
        range.setEnd(after, 1)
        sel.addRange(range)
      }
    }
  }

  // temporary here
  const [rawMD, setRawMD] = useState("")

  const makeRawLine = children => {
    return children
      .map(it =>
        it.nodeName === "#text"
          ? it.textContent.replace(/(?<!\\)`/g, "\\`")
          : it.nodeName === "BR"
          ? ""
          : `\`${it.textContent}\``,
      )
      .join("")
  }

  const makeRawMD = root => {
    let childNodes = Array.from(root.childNodes)
    let startOfSecond = childNodes.length
    for (let idx = 0; idx < childNodes.length; idx++) {
      if (childNodes[idx].nodeName === "DIV") {
        startOfSecond = idx
        break
      }
    }
    let firstLine = childNodes.slice(0, startOfSecond)
    let lines = [makeRawLine(firstLine)]
    childNodes
      .slice(startOfSecond)
      .forEach(div => lines.push(makeRawLine(Array.from(div.childNodes))))
    let raw = lines.join("\n")
    setRawMD(raw)
  }

  useLayoutEffect(() => {
    makeRawMD(editorRef.current)
  }, [])

  return (
    <React.Fragment>
      <h3>editor</h3>
      <div
        className="wrapper"
        contentEditable="true"
        onKeyDown={onKeyDown}
        onInput={e => {
          makeRawMD(e.target)
        }}
        ref={editorRef}
      >
        before&nbsp;
        <span className={"code"}>text sample</span>
        later
      </div>
      <h3>raw markdown</h3>
      <div className="rawView">
        {rawMD.split("\n").map((it, idx) => {
          return it === "" ? <br key={idx}></br> : <div key={idx}>{it}</div>
        })}
      </div>
    </React.Fragment>
  )
}
