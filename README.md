# Template
a very simple javascript to bundle up a single app

### Requirements
- io.js [https://iojs.org/](https://iojs.org/])
- jsdoc [https://github.com/jsdoc3/jsdoc](https://github.com/jsdoc3/jsdoc)

### Configuration via JSON
    
#### Metadata

First we define name, version, source- and target-directory:

    {
        "name": "template",
        "version": "0.0.1",
        "source": "src",
        "target": "bin"
    }
    
Next we add files (css, html and js) which will be bundled:

        "bundle": [
            "app.js",
            "app.css",
            "view_deps.html",
            "view_header.html",
            "view_navbar.html"
        ]
        
Sometimes we need to copy files from external sources like jquery and bootstrap (no bundle).
So we use "copy" instead of "bundle":

        "copy": [
            "deps/bootstrap-dark.min.css",
            "deps/bootstrap.min.js",
            "deps/fonts",
            "deps/jquery2.min.js"
        ]
        
All the html files will be bundled into one single file via "index" keyword:
        
        "index": "index.html"
        
Template automatically uses jsdoc to create an online documentation out of your bundled js files.
You can create your own documentation main page via "readme" keyword:

        "readme": "Readme.md"

If you want to deploy your app (result in "bin" directory) to an external location use the "deploy" keyword:

        "deploy": [
            "/opt/httpd/htdocs/"
        ]

### Running Template from Commandline

    node make.js

### Build Structure in "bin"

    css                 Stylesheets
    doc                 Online Dokumentation created by jsdoc
    fonts               Fonts and Icons used by Bootstrap
    js                  Selfmade- and 3rd-Party-JavaScript files
    index.html          SinglePage Website
