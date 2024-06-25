# Upload Your Website Onto IPFS

web3.storage (Storacha) has robust tools to upload anything to IPFS. Use this guide in JavaScript to learn how to take a pre-exisiting website and upload all of it's contents into IPFS. The example below is just for backend. Feel free to to fork and manipulate the code samples for your needs. We have a [directory](https://github.com/dcrules2/pl-sample-storacha/blob/main/README.md#directory) at the bottom where we encourage you to a PR to show off your project. Feel free to reach out in the [Discord](https://discord.com/invite/KKucsCpZmY) with any comments or questions. 

Access the full assignment requirements [here](https://github.com/dcrules2/pl-sample-storacha/blob/main/instructions.txt).

## Dependancies

Node.js version 18 or higher and npm version 7 or higher to complete this guide. 

```node --version && npm --version```

Install the following dependencies:
- `@web3-storage/w3cli`
- `fs`
- `axios`
- `cheerio`
- `files-from-path`
-

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
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

// URL of the HTML page to download
const url = 'https://http.cat/';

// Create __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path where the HTML, Images, and CSS files will be saved
const folderPath = path.join(__dirname, 'temp');
const assetsDir = path.join(folderPath, 'assets');

// Function to create directories if they don't exist
async function createDirectories() {
    try {
        await fs.mkdir(folderPath, { recursive: true });
        console.log(`Directory created or already exists: ${folderPath}`);
        
        await fs.mkdir(assetsDir, { recursive: true });
        console.log(`Assets directory created or already exists: ${assetsDir}`);
    } catch (error) {
        console.error('Error creating directories:', error);
        throw error; // Rethrow the error to handle it elsewhere
    }
}

// Function to download the HTML
async function downloadHTML(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error downloading the HTML:', error);
        throw error; // Rethrow the error to handle it elsewhere
    }
}

// Function to save HTML to a file
async function saveHTMLToFile(html) {
    const filePath = path.join(folderPath, 'index.html');
    try {
        await fs.writeFile(filePath, html);
        console.log(`HTML downloaded and saved to ${filePath}`);
        return filePath;
    } catch (error) {
        console.error('Error saving HTML to file:', error);
        throw error; // Rethrow the error to handle it elsewhere
    }
}

// Function to scrape images, stylesheets, and scripts from the HTML content
async function scrapeResources(htmlFilePath) {
    try {
        const html = await fs.readFile(htmlFilePath, 'utf-8');
        const $ = cheerio.load(html);
        
        // Select img, link, and script elements
        const elements = $('img, link, script');

        const downloadPromises = [];
        const updates = []; // Store updates to apply to HTML

        elements.each((index, element) => {
            let resourceUrl, attribute, originalUrl;
            
            if (element.tagName === 'img') {
                attribute = 'src';
            } else if (element.tagName === 'link') {
                attribute = 'href';
            } else if (element.tagName === 'script') {
                attribute = 'src';
            }

            originalUrl = $(element).attr(attribute);
            if (!originalUrl) {
                console.warn(`Element ${element.tagName} at index ${index} does not have a valid ${attribute} attribute.`);
                return; // Skip this element if attribute is missing
            }

            resourceUrl = originalUrl.startsWith('http') ? originalUrl : `${url}${originalUrl}`;
            
            const filename = path.basename(originalUrl);
            const localPath = `/assets/${filename}`;

            updates.push({
                element,
                attribute,
                originalUrl,
                localPath
            });

            const absoluteUrl = resourceUrl.startsWith('http') ? resourceUrl : `${url}${resourceUrl}`;
            const filepath = path.join(assetsDir, filename);
                
            downloadPromises.push(downloadResource(absoluteUrl, filepath));
        });

        await Promise.all(downloadPromises);

        // Update HTML with local paths
        updates.forEach(({ element, attribute, localPath }) => {
            $(element).attr(attribute, localPath);
        });

        const updatedHtml = $.html();

        // Save updated HTML back to file
        await fs.writeFile(htmlFilePath, updatedHtml);
        console.log('HTML updated successfully.');

    } catch (error) {
        console.error('Error scraping resources:', error);
        throw error;
    }
}

// Function to download and save resources (images, stylesheets, scripts)
async function downloadResource(url, filepath) {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'arraybuffer'
        });

        await fs.writeFile(filepath, response.data);
        console.log(`Resource downloaded successfully: ${filepath}`);
    } catch (error) {
        console.error(`Error downloading resource from ${url}:`, error);
        throw error;
    }
}

// Function to orchestrate the download and scraping
export default async function store() {
    try {
        await createDirectories();
        const html = await downloadHTML(url); // Pass the url here
        if (!html) {
            throw new Error('Downloaded HTML content is empty.');
        }
        const htmlFilePath = await saveHTMLToFile(html);
        await scrapeResources(htmlFilePath);
        console.log('HTML and resources processing completed successfully.');
    } catch (error) {
        console.error('Error storing the data:', error);
    }
}

// Start the process by calling store()
store();
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
const myAccount = await client.login('jamie.david312@gmail.com')

//Set space
await client.setCurrentSpace("did:key:z6Mkqa5W7JZQLuQ1TmmS5o1om5B2KRWZncxnwbCLFWrJm44C")

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
  path.join(process.cwd(), 'app', 'temp'),
  path.join(process.cwd(), 'app', 'temp', 'assets'),
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

// Start the process by calling upload()
upload();
```

To test this, make sure you have `upload();` at the end. Then  can run either run `node upload.js` or `npm run upload`

If you'd like to access the full documentation on utilizing web3.storage with JavaScript, check out our docs [here](https://web3.storage/docs/w3up-client/).

## Combining Storing & Uploading

Now that you have both storing (downloading) and uploading functions done, you can combine the two in `./src/index.js`
Make sure to remove `store()` and `upload()` from the end of their respective files.

```
import store from '../src/app/store.js';
import upload from '../src/app/upload.js';

export default async function run() {
    try {
        await store(); // Wait for store() to complete
        await upload(); // Wait for upload() to complete
        console.log('Upload completed successfully');
    } catch (error) {
        console.error('Error uploading files:', error);
    }
}

run();
```

You run this either with `node src/index.js` or `npm run start`.

## Summary
If you enjoyed this guide, give this repo a star. Feel free to fork and customize. Feel free to make a PR to add your repo to this table for others to reference and check out.

### Directory
| Repo Title | Description | Author |
| --------------- | --------------- | --------------- |
| Guide  | https://github.com/dcrules2/pl-sample-storacha/tree/main   | [dcrules2](https://github.com/dcrules2)   |


