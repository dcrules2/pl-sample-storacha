import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cheerio from 'cheerio';
import axios from 'axios';

export default async function store() {

// URL of the HTML page to download
const url = 'https://http.cat/'; // Static based on assignment

// Create __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path where the HTML, Images, and CSS files will be saved
const filePath = path.join(__dirname, 'temp/index.html');
const imagesDir = path.join(__dirname, 'temp/images');
const cssDir = path.join(__dirname, 'temp/css');

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