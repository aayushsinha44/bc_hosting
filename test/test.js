var DNS = artifacts.require('DNS');
var Website = artifacts.require('Website');
var DNSInstance;

contract('DNS', function(accounts) {
	it("checks", function() {
		return DNS.deployed().then(function(instance) {
			DNSInstance = instance;
			return instance.createWebsite('test.bc');
		}).then(function() {
			return DNSInstance.getDomainAddress('test.bc');
		}).then(function(address) {
			console.log("address", address);
		});
	});
});