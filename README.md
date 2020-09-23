# PhotoViewer

[![Travis](https://img.shields.io/travis/nzbin/photoviewer.svg)](https://travis-ci.org/nzbin/photoviewer)
[![npm](https://img.shields.io/npm/v/photoviewer.svg)](https://www.npmjs.com/package/photoviewer)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/nzbin/photoviewer/blob/master/LICENSE)
[![Gitter](https://img.shields.io/gitter/room/photoviewer/photoviewer.svg)](https://gitter.im/photoviewer/community)
[![Financial Contributors on Open Collective](https://opencollective.com/photoviewer/all/badge.svg?label=financial+contributors)](https://opencollective.com/photoviewer) 

PhotoViewer is a JS plugin to view images just like in windows. [[Examples](https://nzbin.github.io/photoviewer/)]

> If you want to support IE8, please goto [Magnify](https://github.com/nzbin/magnify/).

## Features

- Vanilla JS
- Modal draggable
- Modal resizable
- Modal maximizable
- Image movable
- Image zoomable
- Image rotatable
- Keyboard control
- Fullscreen showing
- Multiple instances
- Browser support IE9+
- RTL support

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

## Contributors

### Code Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].
<a href="https://github.com/nzbin/photoviewer/graphs/contributors"><img src="https://opencollective.com/photoviewer/contributors.svg?width=890&button=false" /></a>

### Financial Contributors

Become a financial contributor and help us sustain our community. [[Contribute](https://opencollective.com/photoviewer/contribute)]

#### Individuals

<a href="https://opencollective.com/photoviewer"><img src="https://opencollective.com/photoviewer/individuals.svg?width=890"></a>

#### Organizations

Support this project with your organization. Your logo will show up here with a link to your website. [[Contribute](https://opencollective.com/photoviewer/contribute)]

<a href="https://opencollective.com/photoviewer/organization/0/website"><img src="https://opencollective.com/photoviewer/organization/0/avatar.svg"></a>
<a href="https://opencollective.com/photoviewer/organization/1/website"><img src="https://opencollective.com/photoviewer/organization/1/avatar.svg"></a>
<a href="https://opencollective.com/photoviewer/organization/2/website"><img src="https://opencollective.com/photoviewer/organization/2/avatar.svg"></a>
<a href="https://opencollective.com/photoviewer/organization/3/website"><img src="https://opencollective.com/photoviewer/organization/3/avatar.svg"></a>
<a href="https://opencollective.com/photoviewer/organization/4/website"><img src="https://opencollective.com/photoviewer/organization/4/avatar.svg"></a>
<a href="https://opencollective.com/photoviewer/organization/5/website"><img src="https://opencollective.com/photoviewer/organization/5/avatar.svg"></a>
<a href="https://opencollective.com/photoviewer/organization/6/website"><img src="https://opencollective.com/photoviewer/organization/6/avatar.svg"></a>
<a href="https://opencollective.com/photoviewer/organization/7/website"><img src="https://opencollective.com/photoviewer/organization/7/avatar.svg"></a>
<a href="https://opencollective.com/photoviewer/organization/8/website"><img src="https://opencollective.com/photoviewer/organization/8/avatar.svg"></a>
<a href="https://opencollective.com/photoviewer/organization/9/website"><img src="https://opencollective.com/photoviewer/organization/9/avatar.svg"></a>

## License

MIT License
