var marked = require('marked');
var fs = require('fs');
var node_path = require('path');
var chokidar = require('chokidar');
var mime = require('mime-types');
var rimraf = require('rimraf');

var arcdown_path = node_path.resolve(__dirname + '/../arcdown');
var public_path = node_path.resolve(__dirname + '/../public');

chokidar.watch(arcdown_path, {
    ignored: /[\/\\]\./ // ignore any hidden files
}).on('all', (event, original_path) => { // in the event of any watched activity...
    var destination_path = original_path.replace('arcdown', 'public');
    if (event == "addDir") { // if adding a dir create a new matching dir in public if it doesn't already exist.
        if (!exists(destination_path)) {
            fs.mkdir(destination_path, (err) => {
                symlink(public_path + '/css', destination_path + '/css', 'dir');
            });
        }
    } else if (event == "add" || event == "change") {
        if (mime.lookup(original_path) == 'text/x-markdown') {
            fs.readFile(original_path, 'utf8', (err, data) => { // read the md file convert and write it to public folder
                data = combine(data);
                destination_path = destination_path.replace(/\.md$/, '.html');
                writeFile(destination_path, data);
            });
        } else {
            fs.readFile(original_path, (err, data) => { // read the md file convert and write it to public folder
                writeFile(destination_path, data);
            });
        }
    } else if (event == "unlink") {
        rm_file(destination_path);
    } else if (event == "unlinkDir") {
        rm_dir(destination_path);
    } else {
        console.log('I did something that the program didn\'t plan on ' + event, original_path);
    }
});

function rm_dir(path) {
    rimraf(path, (err) => {
        if (err) {
            console.log(err);
        }
    });
}

function rm_file(path) {
    if (path.match(/\.md$/)) {
        path = path.replace(/\.md$/, '.html');
    }
    fs.unlink(path, (err) => {
        if (err) {
            console.log(err);
        }
    });
}

function exists(path) {
    try {
        fs.accessSync(path, fs.F_OK);
    } catch (e) {
        return false;
    }
    return true;
}

function symlink(target, link, Typeof) {
    fs.symlink(target, link, Typeof, (err) => {
        if (err) {
            console.log(err);
        }
    });
}

function writeFile(path, content) {
    fs.writeFile(path, content, (error) => {
        if (error) {
            console.log('Can\'t write the file: ' + error);
        } else {
            //console.log(path + ' written');
        }
    });
}

function get_header() { // problem TODO needs to keep memory of these files.
    return fs.readFileSync(__dirname + '/../header.html', 'utf8');
}

function get_footer() { // problem TODO needs to keep memory of these files.
    return fs.readFileSync(__dirname + '/../footer.html', 'utf8');
}

function combine(string) {
    return get_header() + marked(string) + get_footer();
}
