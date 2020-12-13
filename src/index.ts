import { handleKeyDown, makeRawLine } from "./utils"

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

  /**
   * first line of the contentEditable [root] isn't DIV wrapped.
   * rest of the lines, created by [Enter], are DIV wrapped.
   * [Shift + Enter] doesn't create DIV.
   */
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
    let lines = [makeRawLine(firstLine)]
    childNodes
      .slice(startOfSecond)
      .forEach(div => lines.push(makeRawLine(Array.from(div.childNodes))))
    return lines.join("\n")
  }

  /**
   * add [InputEvent] hook
   */
  onInput(cb: (string) => any) {
    this.root.addEventListener("input", () => cb(this.root.textContent))
  }

  _onKeyDown(e: KeyboardEvent) {
    let change = handleKeyDown(e)
    // Generate [InputEvent] manually
    // since it's not fired automatically when there's change
    change && this.root.dispatchEvent(new CustomEvent("input"))
  }
}
