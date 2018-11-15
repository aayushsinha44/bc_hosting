const express = require('express');
const bodyParser= require('body-parser');
const path = require('path');
const port= process.env.PORT || 3000; 
const app = express();
const contract = require('truffle-contract');
const Web3 = require('web3');
const DNSContractJSON = require(path.join(__dirname, 'DNS.json'));
const WebsiteContractJSON = require(path.join(__dirname, 'Website.json'));


app.use(bodyParser.urlencoded({extended:false,limit:'50mb'}));
app.use(bodyParser.json({limit:'50mb'}));
app.use(express.static("src"));

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/portal',(req,res)=>{
    res.sendFile(path.join(__dirname+'/src/portal.html'));
});

app.get('/:name', function(req, res, next) {
    // console.log(req.params.name);
    init();
    var DNSInstance;
    App.contracts.DNS.deployed().then(function (instance) {
    	DNSInstance = instance;
    	return instance.checkDomainAvaibility(req.params.name);
    }).then(function(status) {
    	if (status == false) {
    		console.log(DNSInstance);
    		return DNSInstance.getWebsiteAddress(req.params.name);
    	}
    }).then(function (address) {
    	console.log(req.params.name, address);
    	App.website.networks[4].address = address;
	    App.contracts.Website = contract(App.website);
	    App.contracts.Website.setProvider(App.web3Provider);
	    console.log('Website loaded');
	    App.contracts.Website.deployed().then(function (instance) {
	    	console.log(instance.address);
	    	return instance.getFileHash('index.html');
	    }).then(function (hash) {
	    	console.log(hash);
	    	res.redirect("https://ipfs.io/ipfs/"+hash);
	    }).catch(function (e) {
	    	console.log(e);
	    });
    }).catch(function(e) {
    	console.log(e);
    });
});

app.get('/:address/:fileName', function(req, res, next) {
	init();
	App.website.networks[4].address = address;
    App.contracts.Website = contract(App.website);
    App.contracts.Website.setProvider(App.web3Provider);
    App.contracts.Website.deployed().then(function (instance) {
    	return instance.getFileHash(req.params.fileName);
    }).then(function (hash) {
    	res.redirect("https://ipfs.io/ipfs/"+hash);
    });
});

app.listen(port,()=>{
    console.log('Server started');
});

App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  website: null,
  website_name: null
}
var web3ProviderURL = "https://rinkeby.infura.io/v3/d23a14816f56400b851a0fbf812e998e";

function init() {
	console.log("code started");
    initWeb3();
}

function initWeb3() {
    App.web3Provider = new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/d23a14816f56400b851a0fbf812e998e');
    web3 = new Web3(App.web3Provider);
    initContract();
}

function initContract() {
      App.contracts.DNS = contract(DNSContractJSON);
      App.contracts.DNS.setProvider(App.web3Provider);
      WebsiteContractJSON.networks[4] = {};
      WebsiteContractJSON.networks[4].address = "";
      WebsiteContractJSON.networks.events = {};
      WebsiteContractJSON.networks.links = {};
      App.website = WebsiteContractJSON;
}

function loadWebsite(address) {
    App.website.networks[4].address = address;
    App.contracts.Website = contract(App.website);
    App.contracts.Website.setProvider(App.web3Provider);
}
