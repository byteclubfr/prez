[![npm version](https://badge.fury.io/js/prez.svg)](http://badge.fury.io/js/prez)
[![Dependency Status](https://david-dm.org/lmtm/prez.png)](https://david-dm.org/lmtm/prez)

## prez

Opiniated Reveal slideshow generator with nice PDF output and ability to treat notes as first-class content.

### Install

```sh
npm install -g prez
```

### Feel the magic

In your terminal, go to an empty directory and run:

```sh
prez --init
```

A sample workspace has been generated for you. Then run:

```sh
prez --serve --print --print-theme=simple --watch
```

* edit your slides from `slides` folder (html or markdown)
* if you need some assets, you can work in `images`, `css`, `js`, `media` folders and use `includes.txt`
* your slideshow is automatically built into `build` folder
* your slideshow is hosted and your browser is opened to localhost:9000
* any change you make will rebuild and refresh your browser
* oh, and a printer-friendly `slides.pdf` is automatically generated on any change too

### Step by step

#### Initialize sample workspace

```sh
mkdir sandbox
cd sandbox

prez --init
```

This will create a full workspace with `js`, `images`, etc… where you'll put your custom content. In reality the only required folder is `slides`.

#### Build

```sh
prez
```

This will create a `build` folder with your slideshow.

#### Show

```sh
prez --serve
```

This will run a server on port 9000 and open your local browser to your slideshow.

#### Print

```sh
prez --print --print-theme=simple
```

This will generate "slides.pdf" from your slideshow.

### Such notes!

Option `--such-notes` modifies the print layout and the notes popup so that notes have more space.

Screenshots to come…

### Usage

`prez [<source> [<destination>]] [options]`

* `source` is the slideshow workspace (where you'll have your slides and assets), default = `./`
* `destination` is the target directory, default = `./build/`

Available options:

* `-v`, `--version`: show version and exit
* `-s <dir>`, `--slides-dir=<dir>`: customize name of the folder containing slides (default = `slides`)
* `--skip-reveal`: do not copy reveal.js slides into target directory (useful if you want faster build over existing build)
* `--skip-index`: do not generate `index.html` in target (will remain untouched if already existing)
* `--skip-user`: do not include user assets
* `--theme=<theme>`: choose reveal theme (default = `solarized`)
* `--no-dynamic-theme`: disable ability to change theme from query string
* `--print-notes`: enable special print layout with first-class notes
* `--such-notes`: focus on notes, which will enable a special print layout with notes as first-class content, and more space for them in the notes popup
* `-w`, `--watch`: automatically rebuild (lazy) on changes
* `--serve[=<port>]`: serve slideshow (you can specify port here or use `--port`)
* `-p <port>`, `--port=<port>`: modify http server port (default 9000), you can use value `auto` to use a random available port
* `--no-live-reload`: disable live-reload when serving slideshow
* `--no-open-browser`: do not open local browser automatically when serving slideshow
* `--print[=<file>]`: print slideshow as pdf (requires `--serve` and phantomjs must be installed)
* `--print-theme=<theme>`: theme to be used for pdf output (default = no override)
* `--phantomjs=<path to phantomjs>`: path to phantomjs (default = `phantomjs`)
* `--no-update-notifier`: disable version checking

### TODO

* Lazier reprint in watch mode
* FIX issue with notes too tall in printed pdf
* Put screenshots to compare normal mode and "such notes" mode
* Better styles for "such notes" mode
