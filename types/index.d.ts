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
    headerToolbar?: Array<toolbarOption> | Array<string>;
    footerToolbar?: Array<toolbarOption> | Array<string>;
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
      beforeOpen?: (context?: any) => void;
      opened?: (context?: any) => void;
      beforeClose?: (context?: any) => void;
      closed?: (context?: any) => void;
      beforeChange?: (context?: any, index?: number) => void;
      changed: (context?: any, index?: number) => void;
    };
    index?: number;
    progressiveLoading?: boolean;
    appendTo?: string;
    customButtons?: any;
  }
}

declare class PhotoViewer {
  constructor(items: PhotoViewer.Img[], options?: PhotoViewer.Options);
}

declare module 'photoviewer' {
  export default PhotoViewer;
}
