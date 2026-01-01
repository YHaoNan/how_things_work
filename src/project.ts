import {makeProject} from '@motion-canvas/core';

import intro from './scenes/intro?scene';
import outro from './scenes/outro?scene';
import main from './scenes/main?scene';

export default makeProject({
  scenes: [intro, main, outro],
});
