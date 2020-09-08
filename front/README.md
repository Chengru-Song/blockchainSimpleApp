# Ethereum Deployment Keypoints

## Smart Contract
Since Ethereum uses virtual machine, the contract has to be compiled and bytecode is deployed. The deployed scripts can be written in python or solidity. 

### Vyper
If the contract is written in python. The following can be used to compile a smart contract:
```sh
# install vyper docker image
docker pull vyperlang/vyper
# Use in local as an interactive CLI
docker run -v $(pwd):/code/ -it --entrypoint /bin/bash vyperlang/vyper
```

If using a local compiler to accompany the use of Remix 3, one can type:
If you are use local python enviroment:
```python
vyper-serve
```

If you are using docker:
```shell
docker run -v $(pwd):/code/ -it -p 127.0.0.1:8000:8000 --entrypoint /bin/bash vyperlang/vyper
vyper-serve
```
But `vyper-serve` command never worked for me. One may have to compile the files locally.

### Solidity
If one wants to compile locally, he/she only needs to install solc compiler:
```shell
npm install -g solc
```
Or you can use docker or pre-built binary files


## Deploy smart contract

### Deploy on local machine
First you need to pull a docker image or download geth locally. I prefer to use docker images.

```shell
docker pull ethereum/client-go:alltools-stable
```

Then run the image interactively by typing the following command:

```shell
docker run -it -p 8545:8545 ethereum/client-go:alltools-stable
```

```shell
# create account in each client
mkdir datadir
geth --datadir ./datadir account new
# create genesis block in each of the client by puppeth command to automatically generate genesis.json
puppeth
```

In puppeth, one has to follow specific settings to generate a genesis block.

After creating genesis.json, init the private chain with genesis.json in each client.

```shell
geth --datadir ./datadir init genesis.json
# Then start the client in each node
geth --datadir ./datadir --nat extip:`hostname -i` console
# The authority account should run the following command
geth --datadir ./datadir --nat extip:`hostname -i` --unlock 0 --password password.txt console
# enable others to access smart contract through various apis
geth --identity "admin" --rpc --rpcaddr "0.0.0.0" --rpcport "8545" --rpcapi="db,eth,net,web3,personal,web3" --da
tadir datadir/ --port "30303" --nodiscover --allow-insecure-unlock console
```

The very next thing to do is to add peers to current network
```shell
# check current peers
net.peerCount
# In each client, check the peer node info
admin.nodeInfo.enode
# copy the enode value to the admin console to add peers
admin.addPeer('enode://...')

# the main console need to start mining to discover new peers and write blocks, blocks are generated every 15s. 
miner.start(1)

# check blocks in other peers
eth.getBlock(int)
```

The local private network is built, all things left is to deploy a smart contract on top of it. Here we use remix and build a pretty simple smart contract. 
Click compile details and copy web3deployment code to local and create a .js file

```shell
# unlock current  account
personal.unlockAccount(eth.accounts[0], 'password')
loadScrit('filepath.js')

# contract will be created but will remain undeployed until it is mined
# default account will be enabled before calling a smart contract
web3.eth.defaultAccount = web3.eth.accounts[0]
personal.unlockAccount(web3.eth.defaultAccount)
```

