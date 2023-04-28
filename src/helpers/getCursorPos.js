export default function getCursorPos(e, relativeWindow) {
  let x = 0;
  let y = 0;
  /* Calculate the cursor's x and y coordinates, relative to the image: */
  x = e.pageX - relativeWindow.left;
  y = e.pageY - relativeWindow.top;
  /* Consider any page scrolling: */
  x -= window.scrollX;
  y -= window.scrollY;
  return { x, y };
}
