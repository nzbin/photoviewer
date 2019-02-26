# PhotoViewer

[![npm](https://img.shields.io/npm/v/photoviewer.svg)](https://www.npmjs.com/package/photoviewer)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/nzbin/photoviewer)

PhotoViewer is a JS plugin to view images just like in windows.

> If you want to support IE8, please goto [Magnify](https://github.com/nzbin/magnify/).

## Main Features

- Vanilla JS
- Browser support IE9+
- Modal draggable
- Modal resizable
- Modal maximizable
- Image movable
- Image zoomable
- Image rotatable
- Keyboard control
- Fullscreen showing
- Multiple instances

## Installation

You can install the plugin via npm

```sh
$ npm install photoviewer --save
```

## Quick Start

### Step 1: Include files

```scss
@import 'photoviewer/dist/photoviewer.css';
```

```js
import PhotoViewer from 'photoviewer';
```

or

```html
<!-- Core CSS file -->
<link href="/path/to/photoviewer.css" rel="stylesheet">

<!-- Core JS file -->
<script src="/path/to/photoviewer.js"></script>
```

### Step 2: Initializing

The usage of photoviewer is very simple, the `PhotoViewer` constructor has 2 argument.

1. Array with objects of image info.
2. Options

```js
// build images array
var items = [
    {
        src: 'path/to/image1.jpg', // path to image
        title: 'Image Caption 1' // If you skip it, there will display the original image name(image1)
    },
    {
        src: 'path/to/image2.jpg',
        title: 'Image Caption 2'
    }
];

// define options (if needed)
var options = {
    // optionName: 'option value'
    // for example:
    index: 0 // this option means you will start at first image
};

// Initialize the plugin
var viewer = new PhotoViewer(items, options);
```

### Step 3: Binding Event

At last, binding click event on a button element at initializing.

## License

MIT License