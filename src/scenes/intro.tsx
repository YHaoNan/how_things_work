import {Circle, makeScene2D, Txt} from '@motion-canvas/2d';
import {createRef, waitFor, waitUntil} from '@motion-canvas/core';

export default makeScene2D(function* (view) {
  // Create your animations here

  const text = createRef<Txt>();

  view.add(<Txt ref={text} text={'好奇的事'} />);

  yield* waitFor(5);
});
