## Configuration file

You can store your default preferences in a configuration file.

Prez uses [rc](https://www.npmjs.com/package/rc):

### Supported formats

* JSON with comments
* INI

### Supported locations

* `.prezrc` at the root of your project
* `$HOME/.prezrc`
* `/etc/prezrc`
* More locations are supported (take a look at `rc` doc)

### Supported options and their defaults

* `slides`: defaults to `"slides"`
* `skipReveal`: defaults to `false`
* `skipIndex`: defaults to `false`
* `skipUser`: defaults to `false`
* `keepHidden`: defaults to `false`
* `print`: defaults to `false`
* `printTheme`: defaults to `"simple"`
* `phantomjs`: defaults to `"phantomjs"`
* `suchNotes`: defaults to `false`
* `theme`: defaults to `"solarized"`
* `highlightTheme`: defaults to `"zenburn"`
* `dynamicTheme`: defaults to `true`
* `watch`: defaults to `false`
* `subCovers`: defaults to `false`
* `title`: defaults to your project's `package.json`'s `name` field, or `"Prez"`
* `author`: defaults to your project's `package.json`'s `author` field, or `""`
* `description`: defaults to your project's `package.json`'s `description` field, or `""`
* `parser`: defaults to `"marked"`

Each option matches a [command-line argument](README.md#available-options)
