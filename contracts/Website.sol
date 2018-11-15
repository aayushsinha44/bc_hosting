pragma solidity ^0.4.19;

/**
 * The Website contract
 */
contract Website {

    address public admin;
    string public website_name;

    // (Filename => IPFS Hash)
    mapping (string => string) file;

    mapping (string => bool) is_file_name_acquired;
    mapping (string => uint) file_index;
    string[] file_name;
    uint public file_length = 0;

    modifier restricted() { 
    	require (msg.sender == admin); 
    	_; 
    }

    modifier emptyStringCheck(string name) {
    	bytes memory tempName = bytes(name); // Uses memory
    	uint flag=0;
		if (tempName.length == 0) {
		    flag=1;
		} 
		require(flag == 0);
		_;
    }
    
	function Website (address _admin, string _name) {
		admin = _admin;
		website_name = _name;
	}	

	function addFile(string _name, string _hash) public restricted emptyStringCheck(_name) {
		require(!is_file_name_acquired[_name]);
		file[_name] = _hash;
		file_name.push(_name);
		is_file_name_acquired[_name] = true;
		file_index[_name] = file_length;
		file_length++;
	}

	function updateFile(string _name, string _hash) public restricted {
		file[_name] = _hash;
	}

	function deleteFile(string _name) public restricted {
		require(is_file_name_acquired[_name]);
		is_file_name_acquired[_name] = false;
		delete is_file_name_acquired[_name];
		uint index = file_index[_name];
		delete file_index[_name];
		delete file[_name];
		for(uint i=index; i<file_length-1;i++) {
			file_name[i] = file_name[i+1];
		}
		delete file_name[file_length-1];
		file_length--;
	}

	// Views

	function getFileHash(string _name) public view returns(string) {
		require(is_file_name_acquired[_name]);
		return file[_name];
	}

	function getFileLength() public view returns(uint) {
		return file_length;
	}

	function getFileName(uint _index) public view returns (string) {
        require(_index < file_length);
		return file_name[_index];
	}
}


