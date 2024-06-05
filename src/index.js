const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
import * as W3UPClient from '@web3-storage/w3up-client';

//Access HTML source code
const url = https://http.cat/

function getHTML(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => resolve(data));
      }).on('error', (err) => reject(err));
    });
  }