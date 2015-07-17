// core modules
var vm = require("vm");
var fs = require("fs");
var exec = require("child_process").execSync;

// configuration
var json = "./app.json";
var app = JSON.parse(fs.readFileSync(json));

// build filenames without type
var filetypes = {};
app["bundle"].forEach(function (file) {
    // create filename without filetype
    var parts = file.split("\.");
    var len = parts.length;
    var filename = parts[0];
    for (var i = 1; i < len - 1; i++) {
        filename += parts[i];
    }
    var type = parts[len - 1];
    var files = filetypes[type] || [];
    files.push(filename);
    filetypes[type] = files;
});

// remove previous version and rebuild target directories
exec("rm -rf bin");
fs.mkdirSync(app["target"]);
for (var type in filetypes) {
    fs.mkdirSync(`${app["target"]}/${type}`);
};

// copy non bundled files
app["copy"].forEach(function (file) {
    var parts = file.split("\.");
    var len = parts.length;
    var type = parts[len - 1];
    var sourceFile = `${app["source"]}/${file}`;
    var targetDir = `${app["target"]}/${type}`;
    if (len == 1) { // must be a directory
        parts = file.split("\/");
        len = parts.length;
        if (len > 1) { // true
            sourceFile = `${sourceFile}/*`;
            targetDir = `${app["target"]}/${parts[len - 1]}`;
            fs.mkdirSync(targetDir);
        }
    }
    exec(`cp -rf ${sourceFile} ${targetDir}/`);
});

// create bundle of files
var targets = {};
for (var type in filetypes) {
    var filenames = filetypes[type];
    filenames.forEach(function (filename) {
        // build absolute source and target filename    
        var sourceSuffix = `${filename}.${type}`;
        var sourceFile = `${app["source"]}/${sourceSuffix}`;
        var targetDir = `${app["target"]}/${type}`;
        var targetSuffix = `${filename}-${app["version"]}.${type}`;
        // bundle css and js files into one single file
        if (type == "css" || type == "js" || type == "html") {
            targetSuffix = `${app["name"]}-${app["version"]}.${type}`;
        }
        var targetFile = `${targetDir}/${targetSuffix}`;
        targets[type] = targetSuffix;
        // read from source
        var content = fs.readFileSync(sourceFile);
        // write to target
        if (fs.existsSync(targetFile)) {
            fs.appendFileSync(targetFile, content);
        } else {
            fs.writeFileSync(targetFile, content);
        }
    });
}

// include bundle into index
var indexFile = `${app["target"]}/${ app["index"]}`;
var cssFile = `css/${targets["css"]}`;
var htmlFile = fs.readFileSync(`${app["target"]}/html/${targets["html"]}`);
var jsFile = `js/${targets["js"]}`;
var content = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
</head>
<body>
${htmlFile}
    <link rel="stylesheet" href="${cssFile}" rel="stylesheet">
    <script src="${jsFile}"></script>
</body>
</html>
`;
fs.writeFileSync(indexFile, content);

// cleanup html files
exec(`rm -rf ${app["target"]}/html`);

// create docs
exec(`jsdoc --readme ${app["source"]}/${app["readme"]} ${app["target"]}/${jsFile} -d ${app["target"]}/doc`);

// deploy app
var deployments = app["deploy"] || [];
deployments.forEach(function (deploy) {
    var dir = `${deploy}/${app["name"]}-${app["version"]}`;
    exec(`mkdir -p ${dir}`);
    exec(`cp -rf ${app["target"]}/* ${dir}/`);
});