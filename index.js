import React from "react"
import ReactDOM from "react-dom"

ReactDOM.render(<App />, document.getElementById("root"))

function App() {
  return (
    <div>
      <TextField />
    </div>
  )
}

function TextField() {
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

  return (
    <React.Fragment>
      <div className="wrapper" contentEditable="true" onKeyDown={onKeyDown}>
        before&nbsp;
        <span className={"code"}>text sample</span>
        later
      </div>
    </React.Fragment>
  )
}
