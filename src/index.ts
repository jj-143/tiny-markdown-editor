export default class Editor {
  root?: HTMLElement

  static render(element: HTMLElement): Editor {
    let editor = new Editor()
    editor.root = element
    element.classList.add("editor")
    element.contentEditable = "true"
    element.addEventListener("keydown", editor._onKeyDown.bind(editor))
    return editor
  }

  getRaw(): string {
    let childNodes = Array.from(this.root.childNodes)
    let startOfSecond = childNodes.length
    for (let idx = 0; idx < childNodes.length; idx++) {
      if (childNodes[idx].nodeName === "DIV") {
        startOfSecond = idx
        break
      }
    }
    let firstLine = childNodes.slice(0, startOfSecond)
    let lines = [this._makeRawLine(firstLine)]
    childNodes
      .slice(startOfSecond)
      .forEach(div => lines.push(this._makeRawLine(Array.from(div.childNodes))))
    return lines.join("\n")
  }

  /**
   * add [InputEvent] hook
   */
  onInput(cb: (string) => any) {
    this.root.addEventListener("input", () => cb(this.root.textContent))
  }

  _onKeyDown(e: KeyboardEvent) {
    let change = onKeyDown(e)
    // Generate [InputEvent] manually
    // since it's not fired automatically when there's change
    change && this.root.dispatchEvent(new CustomEvent("input"))
  }

  _makeRawLine(children): string {
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
}

function onKeyDown(e: KeyboardEvent): boolean {
  if (e.key === "`") {
    let selection = window.getSelection()
    let node = selection.focusNode as ChildNode

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

      // contents modified,
      // [InputEvent] should be fired
      return true
    }
  }
  return false
}
