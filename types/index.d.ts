declare namespace PhotoViewer {
  type toolbarOption =
    | 'maximize'
    | 'close'
    | 'zoomIn'
    | 'zoomOut'
    | 'prev'
    | 'fullscreen'
    | 'next'
    | 'rotateRight'
    | 'rotateLeft'
    | 'actualSize';

  export interface Img {
    src: string;
    title?: string;
  }

  export interface Options {
    draggable?: boolean;
    resizable?: boolean;
    movable?: boolean;
    keyboard?: boolean;
    title?: boolean;
    modalWidth?: number;
    modalHeight?: number;
    fixedContent?: boolean;
    fixedModalSize?: boolean;
    initMaximized?: boolean;
    gapThreshold?: number;
    ratioThreshold?: number;
    minRatio?: number;
    maxRatio?: number;
    headToolbar?: toolbarOption[];
    footToolbar?: toolbarOption[];
    icons?: {
      minimize?: string;
      maximize?: string;
      close?: string;
      zoomIn?: string;
      zoomOut?: string;
      prev?: string;
      next?: string;
      fullscreen?: string;
      actualSize?: string;
      rotateLeft?: string;
      rotateRight?: string;
    };
    i18n?: {
      minimize?: string;
      maximize?: string;
      close?: string;
      zoomIn?: string;
      zoomOut?: string;
      prev?: string;
      next?: string;
      fullscreen?: string;
      actualSize?: string;
      rotateLeft?: string;
      rotateRight?: string;
    };
    multiInstances?: boolean;
    initAnimation?: boolean;
    fixedModalPos?: boolean;
    zIndex?: number;
    dragHandle?: boolean;
    callbacks?: {
      beforeOpen?: Function;
      opened?: Function;
      beforeClose?: Function;
      closed?: Function;
      beforeChange?: Function;
      changed: Function;
    };
    index?: number;
    progressiveLoading?: boolean;
  }
}

declare class PhotoViewer {
  constructor(items: PhotoViewer.Img[], options?: PhotoViewer.Options);
}

declare module 'photoviewer' {
  export default PhotoViewer;
}
