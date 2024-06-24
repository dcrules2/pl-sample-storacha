import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import * as cheerio from 'cheerio';

// URL of the HTML page to download
const url = 'https://http.cat/'; // Static based on assignment

// Create __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path where the HTML, Images, and CSS files will be saved
const folderPath = path.join(__dirname, 'temp');
const imagesDir = path.join(folderPath, 'images');
/*
const cssDir = path.join(folderPath, 'assets');
const jsDir = path.join(folderPath, 'assets');
*/


// Function to download and save the HTML
async function downloadHTML() {
    try {
        const response = await axios.get(url);
        const html = response.data;

        // Define the file path
        const filePath = path.join(folderPath, 'index.html');

        // Save the HTML to a file
        fs.writeFile(filePath, html);

        console.log(`HTML downloaded and saved to ${filePath}`);

        return html
    } catch (error) {
        console.error('Error downloading the HTML:', error);
    }
}

/* Function to download and save CSS files
async function downloadCSS($) {
    const cssLinks = $('link[rel="stylesheet"]').map((_, link) => $(link).attr('href')).get();
    await fs.mkdir(cssDir, { recursive: true });

    const cssPromises = cssLinks.map(async (link) => {
        if (link.startsWith('//')) {
            link = 'https:' + link;
        } else if (!link.startsWith('http')) {
            link = url + link;
        }
        try {
            const response = await axios.get(link);
            const cssPath = path.join(cssDir, path.basename(link));
            await fs.writeFile(cssPath, response.data);
            console.log(`CSS downloaded and saved to ${cssPath}`);
        } catch (error) {
            console.error(`Error downloading the CSS from ${link}:`, error);
        }
    });

    await Promise.all(cssPromises);
}*/

/*/ Function to download and save JS files
async function downloadJS($) {
    const jsLinks = $('script[src]').map((_, script) => $(script).attr('src')).get();
    await fs.mkdir(jsDir, { recursive: true });

    const jsPromises = jsLinks.map(async (link) => {
        if (link.startsWith('//')) {
            link = 'https:' + link;
        } else if (!link.startsWith('http')) {
            link = url + link;
        }
        try {
            const response = await axios.get(link);
            const jsPath = path.join(jsDir, path.basename(link));
            await fs.writeFile(jsPath, response.data);
            console.log(`JS downloaded and saved to ${jsPath}`);
        } catch (error) {
            console.error(`Error downloading the JS from ${link}:`, error);
        }
    });

    await Promise.all(jsPromises);
}*/

// Function to parse HTML and extract image URLs
async function getImageUrls(html) {
    const $ = cheerio.load(html);
    const imageUrls = [];

    // Find all <img> tags and extract src attribute
    $('img').each((index, element) => {
        const imageUrl = $(element).attr('src');
        if (imageUrl) {
            // Convert relative URLs to absolute URLs
            imageUrl = html.resolve(baseUrl, imageUrl);
            imageUrls.push(imageUrl);
        }
    });

    return imageUrls;
}

// Function to download an image and save it
async function downloadImage(imageUrl) {
    try {
        const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
        const imageName = path.basename(imageUrl);
        const imagePath = path.join(imagesDir, imageName);

        const writer = fs.createWriteStream(imagePath);
        imageResponse.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`Error downloading image ${imageUrl}:`, error);
        throw error;
    }
}

export default async function store() {
    try {
        // Create the directory if it doesn't exist
        await fs.mkdir(folderPath, { recursive: true });
        console.log(`Directory created or already exists: ${folderPath}`);
        
        await fs.mkdir(imagesDir, { recursive: true });
        console.log(`Images directory created or already exists: ${imagesDir}`);

        // Download the HTML and save it to filePath
        const html = await downloadHTML();
        console.log('HTML downloaded.');

        // Get image URLs from HTML
        const imageUrls = await getImageUrls(html);
        console.log('Image URLs extracted.');

        // Download each image
        const downloadPromises = imageUrls.map(url => downloadImage(url));
        await Promise.all(downloadPromises);

        console.log('All images downloaded successfully.');
    } catch (err) {
        console.error(`Failed to complete the operation: ${err.message}`);
        throw err; 
    }
}
store();