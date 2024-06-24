import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

// Create directory if it doesn't exist
const dir = './temp/images';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const downloadImage = async (url, filepath) => {
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
};

const scrapeImages = async () => {
    try {
        const response = await axios.get('https://http.cat');
        const $ = cheerio.load(response.data);
        const imgElements = $('img');

        const imgPromises = [];
        imgElements.each((index, element) => {
            const imgUrl = $(element).attr('src');
            if (imgUrl) {
                const absoluteUrl = imgUrl.startsWith('http') ? imgUrl : `https://http.cat${imgUrl}`;
                const filename = path.basename(imgUrl);
                const filepath = path.join(dir, filename);
                imgPromises.push(downloadImage(absoluteUrl, filepath));
            }
        });

        await Promise.all(imgPromises);
        console.log('All images downloaded successfully');
    } catch (error) {
        console.error('Error downloading images:', error);
    }
};

scrapeImages();
