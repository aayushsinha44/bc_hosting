var web3ProviderURL = "https://rinkeby.infura.io/v3/d23a14816f56400b851a0fbf812e998e";
App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  website: null,
  website_name: null
}

function init() {
	console.log("extension started");
    initWeb3();
}

function initWeb3() {
    App.web3Provider = new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/d23a14816f56400b851a0fbf812e998e');
    web3 = new Web3(App.web3Provider);
    initContract();
}

function initContract() {
    $.getJSON(chrome.extension.getURL('/config_resources/DNS.json'), function(DNS){
      App.contracts.DNS = TruffleContract(DNS);
      App.contracts.DNS.setProvider(App.web3Provider);
      App.contracts.DNS.deployed().then(function(DNS) {
        console.log("DNS address:", DNS.address);
        $.getJSON(chrome.extension.getURL('/config_resources/Website.json'), function(website) {
          website.networks[4] = {};
          website.networks[4].address = "";
          website.networks.events = {};
          website.networks.links = {};
          App.website = website;
        }).done(function () {
          console.log('done');
        });
      });
    }).done (function() {
      
    });
}

function loadWebsite(address) {
    App.website.networks[4].address = address;
    App.contracts.Website = TruffleContract(App.website);
    App.contracts.Website.setProvider(App.web3Provider);
}

function sleep(milliseconds, bithost) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if (((new Date().getTime() - start) > milliseconds) || (sessionStorage.getItem(bithost) != null)){
            break;
        }
    }
}


init();

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        var url = details.url;
        var domain = url.split("/")[2];
        var extension = domain.split(".")[domain.split(".").length-1];
        var name = domain.split(".")[domain.split(".").length-2];

        // Redirection to bc domain
        if (extension == 'bc') {
            name = name + '.bc';
            chrome.tabs.update({url: chrome.extension.getURL('/config_resources/loading.html')});
            var current_tab_id;
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
              var currTab = tabs[0].id;
              if (currTab) { // Sanity check
                console.log("current tab", currTab);
                current_tab_id = currTab;
              }
            });
            //handleUrl(name); 
            var DNSInstance;
            App.contracts.DNS.deployed().then(function (instance) {
                DNSInstance = instance;
                console.log(name);
                return DNSInstance.checkDomainAvaibility(name);
            }).then(function (status) {
                console.log(status, name, name.length);
                if(status == false) {
                    return DNSInstance.getWebsiteAddress(name);
                }                 
            }).then(function(address) {
                  console.log(address);
                App.website.networks[4].address = address;
                App.contracts.Website = TruffleContract(App.website);
                App.contracts.Website.setProvider(App.web3Provider);
                App.contracts.Website.deployed().then(function(instance) {
                    return instance.getFileHash('index.html');
                }).then(function (hash) {
                    // sessionStorage.setItem(name, "https://ipfs.io/ipfs/"+hash);
                    console.log("current tab to be updated", current_tab_id);
                    chrome.tabs.update(current_tab_id, {url: "https://ipfs.io/ipfs/"+hash});
                }).catch(function (err) {
                    console.log(chrome.extension.getURL('/config_resources/404.html'));
                    chrome.tabs.update(current_tab_id, {url: chrome.extension.getURL('/config_resources/404.html')});
                });  
            });        
        }

        // For anchor tag redirection
        if(name + '.' + extension == 'ipfs.io') {
            try {
                var address = url.split('/')[4];
                var fileName = url.split('/')[5];
                if (typeof fileName !== 'undefined') {
                    chrome.tabs.update({url: chrome.extension.getURL('/config_resources/loading.html')});
                    console.log(address, fileName);
                    // Load website Address
                    App.website.networks[4].address = address;
                    App.contracts.Website = TruffleContract(App.website);
                    App.contracts.Website.setProvider(App.web3Provider);

                    var websiteInstance;
                    App.contracts.Website.deployed().then(function(instance) {
                        websiteInstance = instance;
                        return websiteInstance.getFileHash(fileName);
                    }).then(function(hash) {
                        console.log(fileName, hash);
                        chrome.tabs.update({url: "https://ipfs.io/ipfs/"+hash});
                    });
                }
            } catch (err) {

            }
        }
    },
    {urls: ["<all_urls>"]},
    ["blocking"]
);


function handleUrl(name) {
    var DNSInstance;
    App.contracts.DNS.deployed().then(function (instance) {
        DNSInstance = instance;
        console.log(name);
        return DNSInstance.checkDomainAvaibility(name);
    }).then(function (status) {
        console.log(status, name, name.length);
        if(status == false) {
            return DNSInstance.getWebsiteAddress(name);
        }
    }).then(function(address) {
          console.log(address);
        App.website.networks[4].address = address;
        App.contracts.Website = TruffleContract(App.website);
        App.contracts.Website.setProvider(App.web3Provider);
        App.contracts.Website.deployed().then(function(instance) {
            return instance.getFileHash('index.html');
        }).then(function (hash) {
            chrome.tabs.update({url: "https://ipfs.io/ipfs/"+hash});
        }).catch(function (err) {
            console.log(err);
        });  
    });
}