import {ThreadGenerator} from '@motion-canvas/core';
import {Director} from '@src/common/director';
import audio from './audio.mp3';
import {ChatPoemLayer} from './chat_poem';

export {audio};

export function* program(director: Director): ThreadGenerator {
  yield* director.playLayer(ChatPoemLayer);
}

