const SURROUND_MAP = {
  "`": "code",
  "*": "italic",
  "~": "strike",
  "**": "bold",
}

const SUPPORTING_SURROUNDS = "*`~"

// TODO: should use original key?
// e.g: **bold**, __bold__
const CLASS_TO_KEY = {
  code: "`",
  bold: "**",
  italic: "*",
  strike: "~",
}

type SurroundCapture = {
  surrounded: string
  pre: string
  post: string
  key: string
}

export function makeRawLine(children: ChildNode[]): string {
  return children
    .map(
      it =>
        it.nodeName === "#text"
          ? // FIXME
            // no escaping for now, since no whitespace
            // around the surrounding character is
            // considered "illegal".
            // I did this cus notion did this.
            // but markdown allows it.
            // ? it.textContent.replace(/(?<!\\)`/g, "\\`")
            it.textContent
          : it.nodeName === "BR"
          ? ""
          : it.nodeName === "SPAN" && CLASS_TO_KEY[(it as HTMLElement).className]
          ? `${CLASS_TO_KEY[(it as HTMLElement).className]}${it.textContent}${
              CLASS_TO_KEY[(it as HTMLElement).className]
            }`
          : it.textContent, // fallback
    )
    .join("")
}

/**
 * test for hot characters
 */
export function handleKeyDown(e: KeyboardEvent): boolean {
  const _selection = window.getSelection()
  const _node = _selection.focusNode as ChildNode

  const key = e.key
  const line = _node.textContent
  const sLeft = Math.min(_selection.anchorOffset, _selection.focusOffset)
  const sRight = Math.max(_selection.anchorOffset, _selection.focusOffset)

  // not sure to make below simpler
  let captured = testSurround(key, sLeft, sRight, line)
  if (captured) {
    replaceSurround(_node, captured)
    e.preventDefault()
    return true // there's modification
  }

  captured = testReplacement(key, sLeft, sRight, line)
  if (captured) {
    // <<replace code here>>
    return true
  }

  captured = testMiscHotCharacter(key, sLeft, sRight, line)
  if (captured) {
    // <<replace code here>>
    return true
  }

  return false // no modification
}

/**
 * Testings
 * 1. surround testing
 * 2. replacement testing
 * 3. hot character for misc features
 */

export function testSurround(key: string, sL: number, sR: number, line: string): SurroundCapture {
  if (!SUPPORTING_SURROUNDS.includes(key)) return

  // testing single character
  const lineBefore = line.substring(0, sL)
  const start = lineBefore.lastIndexOf(key)
  if ((start === 0 || line[start - 1] === " ") && start + 1 !== sL) {
    let pre = line.substring(0, start)
    let post = line.substring(sR)
    let surrounded = line.substring(start + 1, sL)
    return {
      pre,
      post,
      surrounded,
      key,
    }
  }

  // testing double character
  // not supporting possible mixed ones, like _*_WORD_*_
  let secondLast = line.substring(0, start).lastIndexOf(key)
  if (
    line[sL - 1] === key &&
    line[secondLast - 1] === key &&
    key + key in SURROUND_MAP &&
    secondLast + 1 !== sL - 1
  ) {
    let pre = line.substring(0, secondLast - 1)
    let post = line.substring(sR)
    let surrounded = line.substring(secondLast + 1, sL - 1)
    return {
      pre,
      post,
      surrounded,
      key: key + key,
    }
  }
  return null
}

export function testReplacement(key: string, sL: number, sR: number, line: string) {
  return null
}
export function testMiscHotCharacter(key: string, sL: number, sR: number, line: string) {
  return null
}

function replaceSurround(node: ChildNode, captured: SurroundCapture) {
  const { pre, post, surrounded, key } = captured
  let parent = node.parentElement
  let elmPre = document.createTextNode(pre)
  let elmPost = document.createTextNode(post)
  let elmSurrounded = document.createElement("span")

  elmSurrounded.className = SURROUND_MAP[key]
  elmSurrounded.textContent = surrounded

  node.replaceWith(elmPost)
  parent.insertBefore(elmPre, elmPost)
  parent.insertBefore(elmSurrounded, elmPost)

  // temporary trick to prevent the span spanning
  let after = document.createTextNode("")
  after.textContent = " "
  parent.insertBefore(after, elmPost)

  let sel = window.getSelection()
  let range = document.createRange()
  sel.removeAllRanges()
  range.setStart(after, 1)
  range.setEnd(after, 1)
  sel.addRange(range)
}
