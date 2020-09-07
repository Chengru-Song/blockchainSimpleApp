var express = require('express');
var router = express.Router();
const multer = require('multer')
const IpfsHttpClient = require('ipfs-http-client')
const { globSource } = IpfsHttpClient
const ipfs = IpfsHttpClient({url: 'https://ipfs.infura.io:5001'})
const fs = require('fs')
const path = require('path')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()+file.originalname)
  }
})
 
var upload = multer({ storage: storage })

const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const testNet = 'https://rinkeby.infura.io/v3/c830786b9a004d78bd0fddd8db1e2f1e'

const abi = [
    {
        "constant": false,
        "inputs": [
            {
                "name": "ipfs",
                "type": "string[]"
            }
        ],
        "name": "addImage",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getImage",
        "outputs": [
            {
                "name": "",
                "type": "string[]"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "address"
            },
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "users",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
]

// const upload = multer({dest: 'uploads/'})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/writechain', upload.array('files', 12), function(req, res, next) {
  const {publicAddress, seedPhrase} = req.body
  const provider = new HDWalletProvider(seedPhrase, testNet)
  const web3 = new Web3(provider)
  const contractAddress = '0xAf835f2244e752fFba564d4a586d95eBb646Ac0C'
  const imageContract = new web3.eth.Contract(abi, contractAddress)
  const ipfsFiles = []
  req.files.forEach(async file => {
    const filePath = path.join(__dirname, '../'+file.path)
    ipfs.add(globSource(filePath)).then(res => {
      ipfsFiles.push(res.cid)
    }).catch(err => {
      console.error(err)
    })
    
  })
  imageContract.methods.addImage(ipfsFiles).send({from: {publicAddress}})
  .then(blockRes => {
    console.log(blockRes)
    res.send({'jason': 'shuai'})
  })
  .catch(err => {
    console.log(err)
  })
  
})

module.exports = router;
