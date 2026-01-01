import {makeScene2D, Circle, Rect} from '@motion-canvas/2d';
import {createRef, easeInExpo, easeOutExpo, waitFor} from '@motion-canvas/core';
import {Colors} from '@src/common/colors';
import {Director} from '@src/common/director';
import {program} from '@workspace/program';

export default makeScene2D(function* (view) {
  view.fill(Colors.background);

  const director = new Director(view);
  

  // 2. Run Main Program
  yield* program(director);

  // 3. Transition Out Animation
  // Cover the scene
  yield* waitFor(0.5); // Hold black/red for a moment
});
