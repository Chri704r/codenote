const fsp = require('fs').promises;
const path = require('path');


const targetDir = "src/components/viewer";

fsp.readdir(targetDir, { withFileTypes: true })
    .then(filenames => {
        for (let filename of filenames) {
            if (filename.isDirectory()) {
                console.log('Folder:', filename.name);
            }
            else {
                    console.log('File:', filename.name);
            }
            // else if (filename.isFile()) {
            //     const ext = path.extname(filename).toLowerCase;
            //     if (ext === '.json' | '.txt' | '.js' | '.ts') {
            //         console.log('File:', filename.name);
            //     }
            // }
        }
    })
    .catch(err => {
        console.log(err);
    });


// Update to use path __dir module
// Final base folder: globalStorageUri + path
// Find way to dynamically update base folder path based on position in directory and retrieve the relevant folders/files
// Create watcher that will watch for changes and dynamically update the folders/files shown on navigation or changes
// Make extension and webview talk to view/update everything dynamically