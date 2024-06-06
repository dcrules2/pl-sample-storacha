import { create } from '@web3-storage/w3up-client';

export default async function upload() {
//Create Client
const client = await create()

//Log into account
const myAccount = await client.login('jamie.david312@gmail.com')

//Set space
const space = await client.currentSpace("Documents")

await myAccount.provision(space.did(z6Mkvj74ZNo32vnQ6c1PohDQ3xkMgqDq7hu756KtBZ1BnyCG))
await client.setCurrentSpace(space.did(z6Mkvj74ZNo32vnQ6c1PohDQ3xkMgqDq7hu756KtBZ1BnyCG))

//Upload downloaded HTML
  
const directoryCid = await client.uploadDirectory('./temp/html01.html');
console.log(`Uploaded directory with CID: ${directoryCid}`);

}