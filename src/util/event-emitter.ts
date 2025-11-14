import mitt from 'mitt';

export type Events = {
  onEditorLoad: HTMLIFrameElement;
};

const emitter = mitt<Events>();

export default emitter;
