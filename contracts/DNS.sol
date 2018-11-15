pragma solidity ^0.4.19;


import "./Website.sol";

/**
 * The WebFactory contract 
 */
contract DNS {

	string[] domain_name;
	uint public domain_name_length = 0;

	address[] public website_address;
    
    // (DomainName => index.html hash)
    mapping (string => string) domain_redirect_map;

    // (Domain_name => Admin_Address)
    mapping (string => address) domain_admin_map;

    // (WebsiteAddress => Name)
    mapping (address => string) address_domain_map;
    // (Name => WebsiteAddress)
    mapping (string => address) domain_address_map;

    // Checks
    mapping (string => bool) is_domain_acquired;

    // Admin => address array of all website
    mapping(address => address[]) admin_website_address_map;

    modifier restricted(string _name) { 
    	require (msg.sender == domain_admin_map[_name]); 
    	_; 
    }

    modifier restricted_name(string _name) { 
    	require (is_domain_acquired[_name]);
    	_; 
    }
    
    
	function createWebsite (string _name) public {
		require(!is_domain_acquired[_name]);
		address _website_address = new Website(msg.sender, _name);
		website_address.push(_website_address);
		domain_name.push(_name);
		domain_name_length++;
		is_domain_acquired[_name] = true;
		address_domain_map[_website_address] = _name;
		domain_admin_map[_name] = msg.sender;
		admin_website_address_map[msg.sender].push(_website_address);
		domain_address_map[_name] = _website_address;
	}	

	function mapDNS(string _name, string _file_address) public restricted(_name) {
		require(is_domain_acquired[_name]);
		domain_redirect_map[_name] = _file_address;
	}

	function transferOwnership(string _name, address _new_admin) public restricted(_name) {
		require(is_domain_acquired[_name]);
		domain_admin_map[_name] = _new_admin;
	}

	// Views

	function checkDomainAvaibility(string _name) public view returns (bool) {
		return !is_domain_acquired[_name];
	}

	function getDomainAddress(string _name) public restricted_name(_name) view returns (string) {
		return domain_redirect_map[_name];
	}

	function getDomainOwner(string _name) public restricted_name(_name) view returns (address) {
		return domain_admin_map[_name];
	}

	function getWebsiteAddress(string _name) public restricted_name(_name) view returns(address) {
		return domain_address_map[_name];
	}

	function getWebsiteName(address _address) public view returns(string) {
		return address_domain_map[_address];
	}

	function getAllDomainAddress() public view returns (address []) {
		return website_address;
	}

	function getUserWebsites() public view returns(address []){
        return admin_website_address_map[msg.sender];
    }
    
}
 
