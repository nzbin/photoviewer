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

  export interface customButton {
    text: string;
    title?: string;
    click?: (context?: any, e?: MouseEvent) => void
  }

  export interface Options {
    draggable?: boolean;
    resizable?: boolean;
    movable?: boolean;
    keyboard?: boolean;
    title?: boolean;
    modalWidth?: number;
    modalHeight?: number;
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
    animationDuration?: number;
    fixedModalPos?: boolean;
    zIndex?: number;
    dragHandle?: string | null;
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
    customButtons?: {
      [k: string]: customButton
    };
    positionFixed?: boolean;
    initModalPos?: {
      top?: number;
      left?: number;
      bottom?: number;
      right?: number;
    }
  }
}

declare class PhotoViewer {
  constructor(items: PhotoViewer.Img[], options?: PhotoViewer.Options);
}

declare module 'photoviewer' {
  export default PhotoViewer;
}
