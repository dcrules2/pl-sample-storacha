import { create } from '@web3-storage/w3up-client';
import fs from 'fs';
import path from 'path';

export default async function upload() {
//Create Client
const client = await create()

//Log into account
const myAccount = await client.login('jamie.david312@gmail.com')

//Set space

/*
Docs were unclear how to call a space already created. 
The docs just show how to create a new space.
Also unclear how to pass the did of a space already created.
*/

const space = await client.currentSpace("Documents")

await myAccount.provision(space.did(z6Mkvj74ZNo32vnQ6c1PohDQ3xkMgqDq7hu756KtBZ1BnyCG))
//running into a error here regarding space.did as undefined
await client.setCurrentSpace(space.did(z6Mkvj74ZNo32vnQ6c1PohDQ3xkMgqDq7hu756KtBZ1BnyCG))

/*
Unclear about dependancies. I got an error with `File`.

Likely need a function to cyle through all the files in ../src/temp
to get them ready to be uploaded a directory vs blob/single file
but I also need a way to test this before I write it all out to catch errors
*/

//Upload downloaded files; just the sample from the docs lightly edited

const files = [
    new File(['../src/temp/html01.html'], 'html01.html'),
    new File(['../src/temp/css/'], 'css/style1.css'),
    new File(['../src/temp/images/100.jpg'], 'images/100.jpg')
  ]
  
const directoryCid = await client.uploadDirectory(files);
//Returning a link to access the newly uploaded files
console.log(`Uploaded directory with CID: https://${directoryCid}.ipfs.w3s.link`)

}