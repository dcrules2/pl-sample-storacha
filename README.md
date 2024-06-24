# Upload Your Website Onto IPFS

web3.storage (Storacha) has robust tools to upload anything to IPFS. Use this guide in JavaScript to learn how to take a pre-exisiting website and upload all of it's contents into IPFS. The example below is just for backend. Feel free to to fork and manipulate the code samples for your needs. We have a [directory](https://github.com/dcrules2/pl-sample-storacha/blob/main/README.md#directory) at the bottom where we encourage you to a PR to show off your project. Feel free to reach out in the [Discord](https://discord.com/invite/KKucsCpZmY) with any comments or questions. 

Access the full assignment requirements [here](https://github.com/dcrules2/pl-sample-storacha/blob/main/instructions.txt).

## Dependancies

Node.js version 18 or higher and npm version 7 or higher to complete this guide. 

```node --version && npm --version```

Install the latest version of w3cli

 ```npm install -g @web3-storage/w3cli```

 Install `fs`, `axios`, and `cheerio`.

 ```npm install fs axios cheerio```

 ## Set Up

Initialize a new Node.js project:

```npm init -y```

Check your `package.json` look similar to this. Take note that I have `"type": "module"` and added some `"scripts"`.

```
{
  "name": "pl-sample-storacha",
  "version": "1.0.0",
  "type": "module",
  "description": "",
  "main": "src/index.js",
  "scripts": {    
    "start": "node src/index.js",
    "store": "node src/app/store.js",
    "upload": "node src/app/upload.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@web3-storage/w3up-client": "^14.1.1",
    "files-from-path": "^1.0.4",
    "formdata-node": "^6.0.3"
  }
}
```

When you're done your file directory should look similar to this. You can use the CLI or your preferred method to add the other files.

```
├── node_modules
├── src
│   ├── app
│   ├── store.js
│   └── upload.js
├── temp
├── .gitattributes
├── .gitignore
├── LICENSE
├── package-lock.json
├── package.json
└── README.md
```

## Extract a Websites Data

Next we'll create functions to download and store a websites contents. In these examples, we will be downloading the contents of `https://http.cat/` and storing them in a `temp` folder. 

In the code block we go over:
- Setting the paths for HTML, CSS, and Images
- Downloading the HTML
- Downloading the Images
  - Using regex to extract images
  - Using a function to check the `src` to confirm these are the images we want not icons, etc.
- Downloading the CSS file


The code can also be accessed [here](https://github.com/dcrules2/pl-sample-storacha/blob/main/src/app/store.js).

 
```
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export default function store() {

// URL of the HTML page to download
const url = 'https://http.cat/'; // Static based on assignment

// Create __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path where the HTML, Images, and CSS files will be saved
const filePath = path.join(__dirname, '../temp/html01.html');
const imagesDir = path.join(__dirname, '../temp/images');
const cssDir = path.join(__dirname, '../temp/css');

// Create the directory if it doesn't exist
fs.mkdir(path.dirname(filePath), { recursive: true }, (err) => {
    if (err) {
        return console.error(`Failed to create directory: ${err.message}`);
    }

    // Download the HTML page
    https.get(url, (response) => {
        if (response.statusCode !== 200) {
            return console.error(`Failed to get '${url}' (${response.statusCode})`);
        }

        // Save the response to a file
        const file = fs.createWriteStream(filePath);
        response.pipe(file);

        file.on('finish', () => {
            file.close();
            console.log('Download completed!');
        });
    }).on('error', (err) => {
        console.error(`Error during HTTP request: ${err.message}`);
    });
});

// Function to download an image
function downloadImage(imageUrl, savePath) {
    https.get(imageUrl, (response) => {
        if (response.statusCode !== 200) {
            return console.error(`Failed to get '${imageUrl}' (${response.statusCode})`);
        }

        // Save the image
        const file = fs.createWriteStream(savePath);
        response.pipe(file);

        file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${imageUrl}`);
        });
    }).on('error', (err) => {
        console.error(`Error during HTTP request: ${err.message}`);
    });
}

// Function to download HTML page and extract images using regex
function downloadImagesFromHtml(url) {
    https.get(url, (response) => {
        if (response.statusCode !== 200) {
            return console.error(`Failed to get '${url}' (${response.statusCode})`);
        }

        let html = '';

        // Accumulate the HTML data
        response.on('data', (chunk) => {
            html += chunk;
        });

        // Process the HTML once fully received
        response.on('end', () => {
            // Regex pattern to match image src attributes
            const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
            let match;

            // Ensure the directory exists
            fs.mkdir(imagesDir, { recursive: true }, (err) => {
                if (err) {
                    return console.error(`Failed to create directory: ${err.message}`);
                }

                // Iterate over matched image src attributes and download images
                while ((match = imgRegex.exec(html)) !== null) {
                    const imageUrl = new URL(match[1], url).href;
                    if (imageUrl.startsWith('https://http.cat/images/')) {
                        const imageName = path.basename(imageUrl);
                        const savePath = path.join(imagesDir, imageName);
                        downloadImage(imageUrl, savePath);
                    }
                }
            });
        });
    }).on('error', (err) => {
        console.error(`Error during HTTP request: ${err.message}`);
    });
}

// Start the process for downloading Images
downloadImagesFromHtml(url);

// Function to download a CSS file
function downloadCss(cssUrl, savePath) {
    https.get(cssUrl, (response) => {
        if (response.statusCode !== 200) {
            return console.error(`Failed to get '${cssUrl}' (${response.statusCode})`);
        }

        // Save the CSS file
        const file = fs.createWriteStream(savePath);
        response.pipe(file);

        file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${cssUrl}`);
        });
    }).on('error', (err) => {
        console.error(`Error during HTTP request: ${err.message}`);
    });
}

// Function to download HTML page and extract CSS links using regex
function downloadCssFromHtml(url) {
    https.get(url, (response) => {
        if (response.statusCode !== 200) {
            return console.error(`Failed to get '${url}' (${response.statusCode})`);
        }

        let html = '';

        // Accumulate the HTML data
        response.on('data', (chunk) => {
            html += chunk;
        });

        // Process the HTML once fully received
        response.on('end', () => {
            // Regex pattern to match CSS link tags
            const cssRegex = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi;
            let match;

            // Ensure the directory exists
            fs.mkdir(cssDir, { recursive: true }, (err) => {
                if (err) {
                    return console.error(`Failed to create directory: ${err.message}`);
                }

                // Iterate over matched CSS link tags and download CSS files
                while ((match = cssRegex.exec(html)) !== null) {
                    const cssUrl = new URL(match[1], url).href;
                    const cssName = path.basename(cssUrl);
                    const savePath = path.join(cssDir, cssName);
                    downloadCss(cssUrl, savePath);
                }
            });
        });
    }).on('error', (err) => {
        console.error(`Error during HTTP request: ${err.message}`);
    });
}

// Start the process to download the CSS file
downloadCssFromHtml(url);

}
```

To test this, make sure you have `store();` at the end. Then you can run either run `node store.js` or `npm run store`.

## Upload to IPFS

Next you'll need to take your files and upload them to IPFS. This code has been made under the assumption you already have an account and a space created. If you need to learn how to make an account or create a space, please reference these [docs](https://web3.storage/docs/quickstart/).

In the code block we go over:
- Creating a client
- Logging into your account
- Accessing a ready-made space through your DID
- Utilizing `uploadDirectory`
- Returning a URL to access the IPFS directory in the console log


Access the full file [here](https://github.com/dcrules2/pl-sample-storacha/blob/main/src/app/upload.js).

 
```
import { create } from '@web3-storage/w3up-client';
import { filesFromPaths } from 'files-from-path';
import fs from 'fs';
import path from 'path';

export default async function upload() {
//Create Client
const client = await create()

//Log into account
const myAccount = await client.login('[INSERT_YOUR_LOGIN_EMAIL_HERE]') //replace [INSERT_YOUR_LOGIN_EMAIL_HERE] with your email

//Set space
await client.setCurrentSpace("did:key:[INSERT_YOUR_DID_HERE]") //replace [INSERT_YOUR_DID_HERE] with your space DID

// Function to recursively get all file paths from a directory
async function getAllFilePaths(dirPath) {
  let filePaths = [];
  const items = await fs.promises.readdir(dirPath, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    if (item.isDirectory()) {
      const subPaths = await getAllFilePaths(fullPath);
      filePaths = filePaths.concat(subPaths);
    } else {
      filePaths.push(fullPath);
    }
  }

  return filePaths;
}

// Define the root directories to scan
const rootDirectories = [
  path.join(process.cwd(), 'temp'),
  path.join(process.cwd(), 'temp', 'images'),
  path.join(process.cwd(), 'temp', 'css')
];

// Get all file paths from the root directories
let allFilePaths = [];
for (const dir of rootDirectories) {
  const filePaths = await getAllFilePaths(dir);
  allFilePaths = allFilePaths.concat(filePaths);
}

console.log(`Found ${allFilePaths.length} files`);

// Get file objects from the file paths
const allFiles = await filesFromPaths(allFilePaths);

console.log(`Uploading ${allFiles.length} files`);

// Upload files to Web3.Storage
const directoryCid = await client.uploadDirectory(allFiles);
console.log(`Uploaded directory with CID: https://${directoryCid}.ipfs.w3s.link`);
}
```

To test this, make sure you have `upload();` at the end. Then  can run either run `node upload.js` or `npm run upload`

If you'd like to access the full documentation on utilizing web3.storage with JavaScript, check out our docs [here](https://web3.storage/docs/w3up-client/).

## Combining Storing & Uploading

Now that you have both storing (downloading) and uploading functions done, you can combine the two in `./src/index.js`
Make sure to remove `store()` and `upload()` from the end of their respective files.

```
// Import functions
import store from '../src/app/store.js';
import upload from '../src/app/upload.js'

//Run functions
store();
await upload()

```

You run this either with `node src/index.js` or `npm run start`.

## Summary
If you enjoyed this guide, give this repo a star. Feel free to fork and customize. Feel free to make a PR to add your repo to this table for others to reference and check out.

### Directory
| Repo Title | Description | Author |
| --------------- | --------------- | --------------- |
| Guide  | https://github.com/dcrules2/pl-sample-storacha/tree/main   | [dcrules2](https://github.com/dcrules2)   |


