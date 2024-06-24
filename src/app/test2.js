import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import * as cheerio from 'cheerio';

// URL of the HTML page to download
const url = 'https://http.cat/';

// Create __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path where the HTML, Images, and CSS files will be saved
const folderPath = path.join(__dirname, 'temp');
const imagesDir = path.join(folderPath, 'images');

// Function to download and save the HTML
async function downloadHTML() {
    try {
        const response = await axios.get(url);
        const html = response.data;

        // Define the file path
        const filePath = path.join(folderPath, 'index.html');

        // Save the HTML to a file
        await fsPromises.writeFile(filePath, html);

        console.log(`HTML downloaded and saved to ${filePath}`);

        return html;
    } catch (error) {
        console.error('Error downloading the HTML:', error);
    }
}

// Function to download and save images
async function downloadImage(url, filepath) {
    const writer = fs.createWriteStream(filepath);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

// Function to scrape images from the HTML page
async function scrapeImages() {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const imgElements = $('img');

        const imgPromises = [];
        imgElements.each((index, element) => {
            const imgUrl = $(element).attr('src');
            if (imgUrl) {
                const absoluteUrl = imgUrl.startsWith('http') ? imgUrl : `https://http.cat${imgUrl}`;
                const filename = path.basename(imgUrl);
                const filepath = path.join(imagesDir, filename);
                imgPromises.push(downloadImage(absoluteUrl, filepath));
            }
        });

        await Promise.all(imgPromises);
        console.log('All images downloaded successfully');
    } catch (error) {
        console.error('Error downloading images:', error);
    }
}

export default async function store() {
    try {
        // Create the directory if it doesn't exist
        await fsPromises.mkdir(folderPath, { recursive: true });
        console.log(`Directory created or already exists: ${folderPath}`);
        
        await fsPromises.mkdir(imagesDir, { recursive: true });
        console.log(`Images directory created or already exists: ${imagesDir}`);

        // Download the HTML and save it to filePath
        const html = await downloadHTML();
        console.log('HTML downloaded.');

        // Scrape images from the HTML page
        await scrapeImages();
        console.log('Images scraped successfully.');
    } catch (error) {
        console.error('Error storing the data:', error);
    }
}

store();
