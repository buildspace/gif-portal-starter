const fs = require('fs'); // filesystem
const anchor = require("@project-serum/anchor");

const account = anchor.web3.Keypair.generate()

fs.writeFileSync('./keypair.json',JSON.stringify(account))