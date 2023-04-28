import getCursorPos from './getCursorPos';

export default function getNewWindowPos(window, relativeWindow, e, offset) {
  const {
    width: relativeWindowWidth,
    height: relativeWindowHeight,
    left: relativeWindowLeft,
    top: relativeWindowTop,
  } = relativeWindow.getBoundingClientRect();
  const { width: windowWidth, height: windowHeight } = window;
  /* Prevent any other actions that may occur when moving over the image */
  e.preventDefault?.();
  /* Get the cursor's x and y positions: */
  const pos = getCursorPos(e, {
    left: relativeWindowLeft,
    top: relativeWindowTop,
  });
  /* Calculate the position of the lens: */
  let x;
  let y;
  if (offset) {
    x = pos.x - offset.x;
    y = pos.y - offset.y;
  } else {
    x = pos.x - windowWidth / 2;
    y = pos.y - windowHeight / 2;
  }
  /* Prevent the lens from being positioned outside the image: */
  if (x > relativeWindowWidth - windowWidth) {
    x = relativeWindowWidth - windowWidth;
  }
  if (x < 0) {
    x = 0;
  }
  if (y > relativeWindowHeight - windowHeight) {
    y = relativeWindowHeight - windowHeight;
  }
  if (y < 0) {
    y = 0;
  }
  return { x, y };
}
