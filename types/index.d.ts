declare namespace PhotoViewer {
  type ToolbarOption =
    | 'minimize'
    | 'maximize'
    | 'close'
    | 'zoomIn'
    | 'zoomOut'
    | 'prev'
    | 'next'
    | 'rotateLeft'
    | 'rotateRight'
    | 'fullscreen'
    | 'actualSize';

  export interface Img {
    src: string;
    title?: string;
  }

  export interface CustomButton {
    text: string;
    title?: string;
    click?: (context: PhotoViewer, event: MouseEvent) => void
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
    headerToolbar?: ToolbarOption[] | string[];
    footerToolbar?: ToolbarOption[] | string[];
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
    animationEasing?: string;
    fixedModalPos?: boolean;
    zIndex?: number;
    dragHandle?: string | null;
    callbacks?: {
      beforeOpen?: (context: PhotoViewer) => void;
      opened?: (context: PhotoViewer) => void;
      beforeClose?: (context: PhotoViewer) => void;
      closed?: (context: PhotoViewer) => void;
      beforeChange?: (context: PhotoViewer, index: number) => void;
      changed?: (context: PhotoViewer, index: number) => void;
    };
    index?: number;
    progressiveLoading?: boolean;
    appendTo?: string | Node;
    customButtons?: {
      [k: string]: CustomButton
    };
    positionFixed?: boolean;
    initModalPos?: {
      top?: number;
      left?: number;
      bottom?: number;
      right?: number;
    };
    errorMsg?: string | ((context: PhotoViewer, index: number) => string);
  }
}

declare class PhotoViewer {
  static instances: PhotoViewer[];
  imageLoaded: boolean;
  images: PhotoViewer.Img[];
  index: number;
  prevIndex: number | null;
  constructor(items: PhotoViewer.Img[], options?: PhotoViewer.Options);
  init(items: PhotoViewer.Img[], options?: PhotoViewer.Options): void;
  open(): void;
  close(): void;
  jump(step: number): void;
  jumpTo(index: number): void;
  zoom(ratio: number, origin?: { x: number; y: number }): void;
  zoomTo(ratio: number, origin?: { x: number; y: number }): void;
  rotate(degree: number): void;
  rotateTo(degree: number): void;
  maximize(): void;
  exitMaximize(): void;
  toggleMaximize(): void;
  fullscreen(): void;
  resize(): void;
}

declare module 'photoviewer' {
  export default PhotoViewer;
}
