import {makePlugin} from '@motion-canvas/core';
import {getOrCreateVisualTestBridge} from './visualTestBridge';

export default makePlugin({
  name: '@how-things-work/visual-test',
  player(player) {
    const bridge = getOrCreateVisualTestBridge();
    bridge.attachPlayer(player);
  },
});

