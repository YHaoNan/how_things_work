import {makeScene2D} from '@motion-canvas/2d';
import {Colors} from '@src/common/colors';
import {Director} from '@src/common/director';
import {program} from '@workspace/program';

export default makeScene2D(function* (view) {
  view.fill(Colors.background);

  const director = new Director(view);
  yield* program(director);
});
