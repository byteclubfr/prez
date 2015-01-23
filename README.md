[![npm version](https://badge.fury.io/js/prez.svg)](http://badge.fury.io/js/prez)
[![Dependency Status](https://david-dm.org/lmtm/prez.png)](https://david-dm.org/lmtm/prez)

## prez

Opiniated Reveal slideshow generator.

Work in progress.

### Why?

I had a mission: print slideshows *with* notes. So I had to customize the print output, make notes visible, struggle with the contents in `<aside>` (not really markdown, not really html, deal with it), and finally throw it all.

Frustrated by `Reveal`'s dumb way of handling side notes from markdown files (yes, that's an edge case), I needed to generate a full `index.html` from a set of `Markdown` files.

`yo reveal` could have done the trick, but its complexity failed me.

Beside, I don't want final result to be bloated with stupid Gruntfile.

### How?

#### Install

```sh
npm install -g prez
```

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

At this time, you must serve folder yourself. `lr-http-server` does the job well, with live-reload included.

```sh
npm install -g lr-http-server
cd build
lr-http-server
```

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
* `-p <port>`, `--port=<port>`: modify http server port (default 9000)
* `--no-live-reload`: disable live-reload when serving slideshow
* `--no-open-browser`: do not open local browser automatically when serving slideshow
* `--no-update-notifier`: disable version checking
