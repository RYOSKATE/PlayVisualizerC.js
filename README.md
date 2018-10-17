# PlayVisualizerC.jp  <a href="http://doge.mit-license.org"><img src="http://img.shields.io/:license-mit-blue.svg"></a>

This repository is for experiments using [PVC.js](https://github.com/RYOSKATE/PlayVisualizerC.js)


## For User

PVC can be used with most modern browsers.

Our build targets are as follows:

[>0.25%, not ie 11 (Browserslist)](http://browserl.ist/?q=%3E0.25%25%2C+not+ie+11)

### Online

Demo page is here.

[https://ryoskate.github.io/PlayVisualizerC.js-exp](https://ryoskate.github.io/PlayVisualizerC.js-exp)

### Offline

1. Download this repository.
1. Open `docs/index.html` by a modern browser.

## For Developer

### Setup environment

* Install node packages

 ```
 npm install
 ```

* After editing files in `src/`, 

```
npm run build
```

to update `js/index.js` by webpack.
