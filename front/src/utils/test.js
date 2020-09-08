const Web3 = require('web3')

const abi = [
	{
		"constant": true,
		"inputs": [],
		"name": "retrieve",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "num",
				"type": "uint256"
			}
		],
		"name": "store",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	}
]

const provider = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
const web3 = new Web3(provider)
const contractAddress = '0xbde1f944213a0f4a31292a4d9d0e8c9f77f9b613'
const storeContract = new web3.eth.Contract(abi, contractAddress)
web3.personal.unlockAccount(publicAddress, seedPhrase, 600)
.then((res) => {
return storeContract.methods.store(12).send({from: publicAddress})
})
.then(blockRes => {
console.log(blockRes)
})
.catch(err => {
console.log(err)
})