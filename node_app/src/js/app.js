// SHAHI TODO
// 3. Map index.html in MapDNS func
// 4. If no index.html in uploaded zip..throw error and stop uploading
//Show file structure during uuploading also with status and loading
//Ayush todo  - refresh page after file upload and block chain transaction complete

App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  website: null,
  website_address: null,
  website_loaded: false
}

//Global Variables
var file_name_hash_map = [];
var file_name_html_blob_url = [];
var tag_arr = ['script','img','link','a'];
var tag_arr_len = tag_arr.length;
var cnt = 0;
var required_cnt = 0;
var html_required_cnt = 0;
var html_uploaded_cnt = -1;
var html_entry_cnt = 0;
var file_length = -1;
var existing_file = [];
var entries_length = 0;
var check_for_only_html = 0;
var total_files_altered = 0;
var metamask_cnt = 0;
var ycounter=0;


function init() {
	console.log('App started....');
	$('#file_upload_form').hide();
	initWeb3();
}

function initWeb3() {
	if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider); 
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/d23a14816f56400b851a0fbf812e998e');
      web3 = new Web3(App.web3Provider);
    }
    initContracts();
}

function initContracts() {
	$.getJSON("DNS.json", function(DNS){
		console.log(DNS);
      App.contracts.DNS = TruffleContract(DNS);
      App.contracts.DNS.setProvider(App.web3Provider);
      App.contracts.DNS.deployed().then(function(DNS) {
        console.log("DNS address:", DNS.address);
        $.getJSON("Website.json", function(website) {
          website.networks[4] = {};
          website.networks[4].address = "";
          website.networks.events = {};
          website.networks.links = {};
					App.website = website;
					//Call mainLoadingHide() after render() is completed
					$.when(render()).then(mainLoadingHide());
        }).done(function () {
          console.log('done');
        });
      });
    }).done ( function() {
      
    });
}

function clearGlobalVariables(){
	$("#loadingConfirmation").val("");
file_name_hash_map = [];
file_name_html_blob_url = [];
tag_arr = ['script','img','link','a'];
tag_arr_len = tag_arr.length;
cnt = 0;
required_cnt = 0;
file_length = -1;
existing_file = [];
html_uploaded_cnt = -1;
html_required_cnt = 0;
ycounter=0;
entries_length = 0;
html_entry_cnt = 0;
check_for_only_html = 0;
total_files_altered = 0;
metamask_cnt = 0;
}

function loadWebsite(address,e) {
	console.log(e);
	document.getElementById("file-input").value = "";
	$(".boughtDomain").css("background","none");
	// $(".boughtDomain").css("background-color:hover","yellow");
	e.style.cssText = 'background-color: grey;';
	// e.css("background-color", "yellow");
	clearGlobalVariables();
	$("#domainInfo").html("");
	$("#domainViewLoading").show();
	$("#file_upload_form").hide();
	// address = address.toString(16);
	App.website.networks[4].address = address;
    App.contracts.Website = TruffleContract(App.website);
    App.contracts.Website.setProvider(App.web3Provider);
    App.website_loaded = true;
    App.website_address = address;
    App.contracts.Website.deployed().then(function(website) {
      console.log("Website Address:", website.address);
      renderWebsiteData();
    });
}

// Render portal for particular clicked website
function renderWebsiteData() {
	console.log("Inside render website data");
	// $('#file_upload_form').show();
	// $.when(getAllFiles()).then(displayDomainFiles());
	getAllFiles();
	//Call domainFIles after this
}


function render() {
	console.log("Rendering started...");
	web3.eth.getCoinbase(function(err, account) {
	  if(err === null) {
		App.account = account;
		console.log("account:", App.account);
		$("#accountNumber").html(App.account)
		//If user hasn't logged in using MetaMask..Display Nothing and give alert
		if(!account){
			$("#portal").hide();
			alert("Please Login using MetaMask to access the portal");
		}
	  }
	});

	// Display all websites owned by the user
	App.contracts.DNS.deployed().then(function(instance) {
	  return (instance.getUserWebsites());
	}).then(function(address) {
	  console.log(address);
	  for(var i=0;i<address.length;i++) {
	    //console.log(address[i]);
	    getWebsiteName(address[i]);
	  }
	});
	var pathname=window.location.pathname;
	console.log(pathname);
		if(pathname.endsWith("index.html")||pathname.endsWith("/")){
			var createWebsiteForm = $('#createWebsiteForm');
			createWebsiteForm.show();
		}

}

function createWebsite() {
	$('#createButton').prop('disabled', true);
	$("#mainLoading").show();
	$("#portal").hide();
	$('.modale1').removeClass('opened1');
	$("#createWebsiteForm").hide();
	var website_name = $('#websiteName').val().toLowerCase();
	// TODO check website_name
	website_name  = website_name;
	App.contracts.DNS.deployed().then(function(instance,err) {
	  return instance.createWebsite(website_name, {
	    from: App.account,
	    gas: 5000000
	  });
	}).then(function(result) {
		console.log("Website created");
		//This is added to reload the portal if website is created from portal to add the new website in domainsList
		var pathname=window.location.pathname;
		if(pathname.endsWith("portal.html")){
			location.reload();
		}else{
			//If website created from index.html, display alert "Website created successfuly"
			$("#createWebsiteForm").show();
			$("#mainLoading").hide();	
			location.reload();
		}
	  $('form').trigger('reset');
	}).catch(function(){
		alert("There was some error during your transaction.");
		$("#mainLoading").hide();
		$("#portal").show();
		$("#createWebsiteForm").show();
	});
}

function getWebsiteName(address) {
	App.contracts.DNS.deployed().then(function(instance){
		return instance.getWebsiteName(address);
	}).then(function(name){

		// TODO onclick call loadWebsite
		var domele = "<div class='boughtDomain' val='"+address+"' id='boughtDomainItem' onclick=loadWebsite('"+address+"',this)>"+name +"</div>";
		$("#domainsList").append(domele);
		console.log(name, address);
	});
}

function checkValidDomain(name){
	
	for (var i = 0; i < name.length; i++) {
		if((name.charAt(i)>='0'&&name.charAt(i)<='9')||(name.charAt(i)>='a'&&name.charAt(i)<='z')||(name.charAt(i)=='-')){
			continue;
		}else{
			console.log("Invalid");
			console.log(name.charAt(i));
			return false;
		}
	  }
	  return true;
}

function checkDomainAvaibility() {
	$("#domainCheckLoading").show();
	var website_name = $("#websiteName").val().toLowerCase();
	$("#websiteName").val(website_name);
	website_name = website_name.trim();
	if(website_name.charAt(0)=='-'||website_name.charAt(website_name.length-1)=='-'){
		console.log("Invalid");
		alert("Domain name can't begin or end with -");
		$("#domainCheckLoading").hide();
		return;
	}
	// checkValidDomain(website_name);
	if(!checkValidDomain(website_name)){
		alert("Special Characters and spaces are not allowed in the domain");
		$("#domainCheckLoading").hide();
		return;
	}
	website_name = website_name;
	App.contracts.DNS.deployed().then(function(instance) {
		return instance.checkDomainAvaibility(website_name);
	}).then(function(status) {
		console.log(status);
		$("#domainCheckLoading").hide();
		if(status == true) {
			console.log('Domain Available');
			$('#createButton').prop('disabled', false);
			$("#domainIsAvailable").show();
			$("#domainIsUnavailable").hide();
			$('#websiteName').attr('readonly', true);
		} else {
			console.log("Domain Unavailable");
			$("#domainIsAvailable").hide();
			$("#domainIsUnavailable").show();
			$('#websiteName').attr('readonly', false);
		}
	}).catch(function(err) {
		
	});
}

function uploadHashToBlockChain(name, hash) {
	App.contracts.Website.deployed().then(function(instance) {
		return instance.addFile(name, hash,  {
			from: App.account,
			gas: 5000000
		  });
	}).then(function () {
		console.log('File uploaded successfully');
		ycounter+=1;
		var fileStr= "fileNumber"+String(ycounter);
		$("#"+fileStr).removeClass("fa-clock-o");
		document.getElementById(fileStr).style.color = "green";
		$("#"+fileStr).addClass("fa-check-circle");
		document.getElementById(fileStr).style.color = "green";
		//$("#loadingConfirmation").append("<div style='height:25px;margin-top:10px;'><i class='fa fa-check-circle' style='color:green;'></i></div>");
		metamask_cnt++;
		console.log(name);
		console.log("Testing Successfully");
		console.log(metamask_cnt,total_files_altered);
		if(metamask_cnt === total_files_altered)
		{
			//hide modal
			$('.fileListDuringUpload').removeClass('opened1');
			//refresh page
			location.reload();
		}
	}).catch(function(err) {
		console.log(err);
	});
}

function updateHashOnBlockChain(name, hash) {
	App.contracts.Website.deployed().then(function(instance) {
		return instance.updateFile(name, hash,  {
			from: App.account,
			gas: 5000000
		  });
	}).then(function () {
		console.log('File updated successfully');
		ycounter+=1;
		var fileStr= "fileNumber"+String(ycounter);
		$("#"+fileStr).removeClass("fa-clock-o");
		document.getElementById(fileStr).style.color = "green";
		$("#"+fileStr).addClass("fa-check-circle");
		
		//$("#loadingConfirmation").append("<div style='height:25px;margin-top:10px;'><i class='fa fa-check-circle' style='color:green;'></i></div>");
		metamask_cnt++;
		console.log("Testing Successfully");
		console.log(metamask_cnt,total_files_altered);
		if(metamask_cnt === total_files_altered)
		{
			//hide modal
			$('.fileListDuringUpload').removeClass('opened1');
			//refresh page
			location.reload();
		}
	}).catch(function(err) {
		console.log(err);
	});
}

function deleteHashOnBlockChain(name) {
	var confirmation = confirm("Are you sure you want to delete this file?");
	if(confirmation==true){
	console.log(name);
	App.contracts.Website.deployed().then(function(instance) {
		return instance.deleteFile(name,  {
			from: App.account,
			gas: 5000000
		  });
	}).then(function () {
		console.log('File deleted successfully');
		clearGlobalVariables();
		document.getElementById("file-input").value = "";
		$("#domainInfo").html("");
		$("#domainViewLoading").show();
		$("#file_upload_form").hide();
		// address = address.toString(16);
		App.contracts.Website = TruffleContract(App.website);
		App.contracts.Website.setProvider(App.web3Provider);
		App.website_loaded = true;
		App.contracts.Website.deployed().then(function(website) {
		  console.log("Website Address:", website.address);
		  renderWebsiteData();
		});
	}).catch(function(err) {
		alert("There was some error during deletion of file");
	});
}
}


// Maps website with starting file (address)
function mapDNS(website_name, file_hash) {
	App.contracts.DNS.deployed().then(function(instance) {
		return instance.mapDNS(website_name, file_has, {
			from: App.account,
			gas: 5000000
		  });
	}).then(function (){
		console.log('Website mapped successfully.');
	});
}


function getAllFiles() {
	var website_instance;
	console.log("Inside getAllfiles()");
	App.contracts.Website.deployed().then(function(instance){
		website_instance = instance;
		return website_instance.getFileLength();
	}).then(function(fileLength) {
		file_length = fileLength.c[0];
	}).then(function () {
		console.log('file length:', file_length);
		if(file_length == 0) {
			displayDomainFiles();
		} else {
			for(var i=0;i<file_length;i++) {
				evaluateFile(website_instance.getFileName(i));
			}
		}
	});
}

function evaluateFile(fileName) {
	fileName.then(function(result) {
		console.log(result);
		existing_file.push({fileName: result, hash: ""});
		getFileHashFromBlockChain(result);
	})
}

function getFileHashFromBlockChain(fileName) {
	App.contracts.Website.deployed().then(function(instance) {
		return instance.getFileHash(fileName);
	}).then(function(hash) {
		for(var i=0;i<existing_file.length;i++) {
			if (existing_file[i].fileName === fileName) {
				existing_file[i].hash = hash;
			}
		}
		if(existing_file.length == file_length) {
			displayDomainFiles();
		}
	});
}

// This function is called when all files and hash 
// information is retrieved from blockhain
function displayDomainFiles(){
	$("#domainViewLoading").hide();
	console.log(existing_file);
	console.log(existing_file.length);
	var existing_file_length= existing_file.length;
	if(existing_file_length==0){
		$("#domainInfo").html("");
		console.log("ADD BUTTON DISPLAY");
		// $("#domainInfo").html("<button class='btn btn-danger'>Add Files</button>");
		$("#file_upload_form").show();
	}else{
		$("#domainInfo").html("");
		console.log("DISPLAY FILE STRUCTURE");
		console.log("OTHER BUTTONS DISPLAY");
		for(var i=0;i<existing_file_length;i++){
			// existing_file[i].hash
			//console.log(existing_file[i].fileName);
			$("#domainInfo").append("<div class='domainIndividualFile'>"+rechangeFileName(existing_file[i].fileName)+"<i class='fa fa-trash' style='float:right;margin-right:5px;cursor:pointer;color:red;' title='Delete this file' onclick=deleteHashOnBlockChain('"+existing_file[i].fileName+"')></i></div>");
		// 	if(i==existing_file_length-1){
		// 		document.getElementById("domainsList").style.height="100%";
		// document.getElementById("domainsList").style.backgroundColor="9bafc1";
		// 	}
		}
		$("#file_upload_form").show();
	}
}

//This function is called when all current files are uploaded to ipfs (except html files)-->doubt.
function handle_update_files(){
	console.log("Called One time");
	var existing_file_length = existing_file.length;
	var len = file_name_hash_map.length;
	var flag;
	for(var i=0;i<len;i++)
	{
			flag=0;
			for(var j=0;j<existing_file_length;j++)
			{
				if(existing_file[j].fileName === file_name_hash_map[i].name)
				{
					flag=1;
					//existing_file[j].hash = file_name_hash_map[i].hash;
					updateHashOnBlockChain(file_name_hash_map[i].name,file_name_hash_map[i].hash);
					total_files_altered++;
					break;
				}
			}
			if(flag === 0)
				uploadHashToBlockChain(file_name_hash_map[i].name,file_name_hash_map[i].hash),
				total_files_altered++;
	}
{/* <a href="https://apple.bc/" target="_blank">View your domain</a> */}
	var len = file_name_html_blob_url.length;
	console.log(len);
	html_required_cnt = len;
	console.log(html_required_cnt);
	html_uploaded_cnt = 0;
	if(html_uploaded_cnt === html_required_cnt)
		{
			upload_existing_html_files();

		}
	else
	{
  	for(var i=0;i<len;i++){
  		cnt = -10;

  		var url_blob = file_name_html_blob_url[i].url;
  		var fname_blob = file_name_html_blob_url[i].fname;

  		console.log("upload_Html_Files",url_blob,fname_blob);
  		handlingHTMLUpload(url_blob, fname_blob);
  		
	  }
	}
}

function upload_existing_html_files(){
	var existing_file_length = existing_file.length;
	var len = file_name_hash_map.length;
	var extension,flag,j;
	console.log("Existing_File",existing_file_length);
	for(var i=0;i<existing_file_length;i++)
	{
		extension = getFileExtension(existing_file[i].fileName);
		if(extension===''){
			continue;
		}
		if(extension === 'htm' || extension === 'html')
		{
			flag=0;
			for(j=0;j<len;j++)
			{
				if(existing_file[i].fileName === file_name_hash_map[j].name)
				{
					flag=1;
					break;
				}
			}
			
			if(flag === 0)
			{
				//Refracting existing html files
				refracted_html = refract_existing_files(existing_file[i].fileName,existing_file[i].hash);
				//Reupload it to Ipfs
				var fileGenerated = new File([refracted_html],existing_file[i].fileName,{type:'text/html'});
				reuploadFileToIPFS(fileGenerated,existing_file[i].fileName,"html");
			}
		}
	}
}
//Things to handle here
function refract_existing_files(fileName,hash){
	url = "https://ipfs.io/ipfs/" + hash;
	response = get_response_https(url);
	var parsedDoc = new DOMParser().parseFromString(response, 'text/html');
	for(var i=0;i<tag_arr_len;i++){
		var tag = parsedDoc.getElementsByTagName(tag_arr[i]);
		var len = tag.length;
		for(var j=0;j<len;j++){
		if( tag_arr[i] === 'link' ){
			console.log(tag[j].href);
			if(tag[j].href.startsWith("https://ipfs.io/ipfs/"))
			{
				var old_hash = tag[j].href.split('https://ipfs.io/ipfs/')[1];
				console.log("Older Hash="+old_hash);
				var file_name_from_hash = get_file_name_from_hash(old_hash);//older hash
				var new_hash = get_new_hash(file_name_from_hash);
				tag[j].href = 'https://ipfs.io/ipfs/' + new_Hash;
			}
		}
		else if( tag_arr[i] === "a" )
		{
			continue;
		}
		else{
			console.log(tag[j].src);
			if(tag[j].src.startsWith("https://ipfs.io/ipfs/"))
			{
				var old_hash = tag[j].src.split('https://ipfs.io/ipfs/')[1];
				console.log("Older Hash="+old_hash);
				var file_name_from_hash = get_file_name_from_hash(old_hash);//older hash
				var new_hash = get_new_hash(file_name_from_hash);
				tag[j].src = 'https://ipfs.io/ipfs/' + new_Hash;
		    }
			}	
		}
	}
	return parsedDoc.documentElement.outerHTML + "";
}

function get_file_name_from_hash(old_hash){
	var existing_file_length = existing_file.length;
	for(var i=0;i<existing_file_length;i++)
	{
		if(existing_file[i].hash === old_hash)
			return existing_file[i].fileName;
	}
}

function get_new_hash(file_name){
	var len = file_name_hash_map.length;
	for(var i=0;i<len;i++)
	{
		if(file_name_hash_map[i].name === file_name)
			return file_name_hash_map[i].hash;
	}
	for(var i=0;i<existing_file_length;i++)
	{
		if(existing_file[i].FileName === file_name)
			return existing_file[i].hash;
	}
	return "";
}

function reuploadFileToIPFS(file,fileName,extension) {
	const reader = new FileReader();
	reader.onloadend = function() {
		const ipfs = window.IpfsApi('ipfs.infura.io', 5001,  {protocol: 'https'}); // Connect to IPFS
		const buf = buffer.Buffer(reader.result); // Convert data into buffer
		ipfs.files.add(buf, (err, result) => { // Upload buffer to IPFS
		  if(err) {
		    console.error(err);
		    return;
		  }
		  let url = 'https://ipfs.io/ipfs/' + result[0].hash;
		  console.log('Url', url);
		  updateHashOnBlockChain(fileName, result[0].hash);
		  total_files_altered++;
		});
	}
	reader.readAsArrayBuffer(file); 
}

function get_response_https(url){
	$.get("https://cors-anywhere.herokuapp.com/"+url, function(response) {
		return response;
  	});
}

function uploadFileToIPFS(file,fileName,extension) {
	const reader = new FileReader();
	reader.onloadend = function() {
		const ipfs = window.IpfsApi('ipfs.infura.io', 5001,  {protocol: 'https'}); // Connect to IPFS
		const buf = buffer.Buffer(reader.result); // Convert data into buffer
		ipfs.files.add(buf, (err, result) => { // Upload buffer to IPFS
		  if(err) {
		    console.error(err);
		    return;
		  }
		  let url = 'https://ipfs.io/ipfs/' + result[0].hash;
		  console.log('Url', url);
		  console.log(fileName,extension);
		  //uploadHashToBlockChain(fileName, result[0].hash);
		  file_name_hash_map.push({name: fileName, hash: result[0].hash});
		  cnt += 1;
		 if(extension === 'html' || extension === 'htm')
		  {
		  	html_uploaded_cnt++;
		  	var flag=0;
		  	var existing_file_length = existing_file.length;
		  	for(var i=0;i<existing_file_length;i++)
		  	{
		  		if(existing_file[i].fileName === fileName)
		  		{
		  			flag=1;
		  			break;
		  		}
		  	}
		  	if(flag === 0)
		  		{
		  			uploadHashToBlockChain(fileName,result[0].hash);
		  			total_files_altered++;
		  		}
		  	else
		  		{
		  			updateHashOnBlockChain(fileName,result[0].hash);
		  			total_files_altered++;
		  		}
		  	console.log("Joey");console.log("Joey");console.log("Joey");console.log("Joey");console.log("Joey");console.log("Joey");
		  	console.log(html_required_cnt,html_uploaded_cnt);
		  	if(html_uploaded_cnt === html_required_cnt)
		  		upload_existing_html_files();
		  }
		  console.log("checking for cnt");
		  console.log(cnt);
		  console.log(required_cnt);
		  if(cnt === required_cnt) {
		  	console.log("html",fileName);
		  	required_cnt = -10000;
		  	handle_update_files();
		  }
		});
	}
	reader.readAsArrayBuffer(file); 
}

function getFileHash(fileName){
	console.log(file_name_hash_map,fileName,"check");
	var len = file_name_hash_map.length;
	for(var i=0;i<len;i++){
		if(file_name_hash_map[i].name === fileName){
			console.log(fileName,file_name_hash_map[i].hash);
			return file_name_hash_map[i].hash;
		}
	}
	len = existing_file.length;
	for(var i=0;i<len;i++)
	{
		if(existing_file[i].fileName === fileName){
			return existing_file[i].hash;
		}
	}
	return "";
}

function getFileExtension(dirName){
	if(dirName===""){
		return "";
	}
	dirName = dirName.split('#$@!=%&()');
	var dirLength = dirName.length;
	return dirName[dirLength-1].toLowerCase().split('.');
}

function getChangedFileName(dirName){
	var dirLength = dirName.length;
	var dirStructure = "";
	if(dirLength>0 && dirName[dirLength-1] === ""){
		dirLength = dirLength-1;
	}

	for(var i=0;i < (dirLength-1);i++){
		//dirStructure = dirStructure+dirName[i]+"#$@!=%&()";
		if(dirName[i] !== "" && dirName[i] !== "http:" && dirName[i] !== "https:" && dirName[i] !== "localhost:3000" && dirName[i] !== "127.0.0.1:5500" && dirName[i] !== "shahi9935.github.io" && dirName[i] !== "BC-Hosting")
		dirStructure = dirStructure+dirName[i]+"#$@!=%&()";
	}

	if(dirLength-1 >= 0)
		dirStructure = dirStructure+dirName[dirLength-1];
	console.log(dirStructure,"old");
	var new_dir_Structure = "";
	var new_dir_Name = dirStructure.split("#$@!=%&()");
	var new_dir_length = new_dir_Name.length;

	if(new_dir_length>0 && new_dir_Name[new_dir_length-1] === ""){
		new_dir_length = new_dir_length-1;
	}

	for(var i=1;i<(new_dir_length-1);i++)
	{
		//new_dir_Structure = new_dir_Structure + new_dir_Name[i] + "__";
		new_dir_Structure = new_dir_Structure + new_dir_Name[i] + "#$@!=%&()";
	}

	if(new_dir_length-1 >= 0)
		new_dir_Structure = new_dir_Structure + new_dir_Name[new_dir_length-1];

	console.log(dirName,new_dir_Structure);
	return new_dir_Structure;
}

function rechangeFileName(fileName){
	var dirName = fileName.split("#$@!=%&()");
	var dirLength = dirName.length;
	var dirStructure = "";
	for(var i=0;i<dirLength-1;i++)
		dirStructure = dirStructure + dirName[i] + '/' ;
	dirStructure = dirStructure + dirName[dirLength-1];
	return dirStructure;
}

function handlingHTMLUpload(url_blob, fname_blob) {
	console.log("inside handlingHTML");
	$.get(url_blob, function(response) {
		var refracted_html = refract_notexisting_file(response);
		var fileGenerated = new File([refracted_html],fname_blob, {type:'text/html'});
		uploadFileToIPFS(fileGenerated,fname_blob,"html");
  	});
}
//Copied Function
function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: mimeString});
}

function refract_notexisting_file(html) {
	var parsedDoc = new DOMParser().parseFromString(html, 'text/html');
	for(var i=0;i<tag_arr_len;i++){
		var tag = parsedDoc.getElementsByTagName(tag_arr[i]);
		var len = tag.length;
		for(var j=0;j<len;j++){
		if( tag_arr[i] === 'link' ){
			console.log(tag[j].href);
			var changedFileName = getChangedFileName(tag[j].href.split('/'));
			console.log("refract"+" "+changedFileName);
			var file_Hash = getFileHash(changedFileName);
			console.log(file_Hash);
			if(file_Hash !== "")
			tag[j].href = 'https://ipfs.io/ipfs/' + file_Hash;
		}
		else if( tag_arr[i] === "a" )
		{
			//Handle Here
			console.log(tag[j].href);
			if(tag[j].href.startsWith("http"))
			continue;
			var changedFileName = getChangedFileName(tag[j].href.split('/'));
			console.log("refract"+" "+changedFileName);
			tag[j].href = 'http://missionimpossible-hackabit.tech/' + App.website_address + '/' + changedFileName;
		}
		else{
			console.log(tag[j].src);
			var changedFileName = getChangedFileName(tag[j].src.split('/'));
			console.log("refract"+" "+changedFileName);
			var file_Hash = getFileHash(changedFileName);
			if(file_Hash !== "")
			tag[j].src = 'https://ipfs.io/ipfs/' + file_Hash;
		}

		}
	}
	return parsedDoc.documentElement.outerHTML + "";
}

// function checkForIndex(model,fileInput){
// 	console.log("Inside checkForIndex");	
// 		model.getEntries(fileInput.files[0], function(entries) {
// 				entries.forEach(function(entry) {
// 					console.log("JsdkhasjkdnaskdnaslDAS");
// 					var a = document.createElement("a");
// 					var dirName = a.text.split('/');
// 					console.log(dirName);
// 					var changedFileName = getChangedFileName(dirName);
// 					console.log(changedFileName);
// 					if(changedFileName=="index.html"){
// 						return true;
// 					}
// 			});
// 		});
// }
/*(function(window){
obj=window;
console.log("Inside self calling");
console.log(window);
})();*/

//Don't Change Anything Here(Zip)
(function(obj) {
	console.log(obj);
	var requestFileSystem = obj.webkitRequestFileSystem || obj.mozRequestFileSystem || obj.requestFileSystem;

	function onerror(message) {
		alert(message);
	}
//Don't Change Anything Here
	function createTempFile(callback) {
		var tmpFilename = "tmp.dat";
		requestFileSystem(TEMPORARY, 4 * 1024 * 1024 * 1024, function(filesystem) {
			function create() {
				filesystem.root.getFile(tmpFilename, {
					create : true
				}, function(zipFile) {
					callback(zipFile);
				});
			}

			filesystem.root.getFile(tmpFilename, null, function(entry) {
				entry.remove(create, create);
			}, create);
		});
	}
//Don't Change Anything Here
	var model = (function() {
		var URL = obj.webkitURL || obj.mozURL || obj.URL;
		console.log(URL,"hihhhh");
		return {
			getEntries : function(file, onend) {
				zip.createReader(new zip.BlobReader(file), function(zipReader) {
					zipReader.getEntries(onend);
				}, onerror);
			},
			getEntryFile : function(entry, creationMethod, onend, onprogress) {
				var writer, zipFileEntry;

				function getData() {
					entry.getData(writer, function(blob) {
						var blobURL =  URL.createObjectURL(blob);
						onend(blobURL);
					}, onprogress);
				}

				if (creationMethod == "Blob") {
					writer = new zip.BlobWriter();
					getData();
				} else {
					createTempFile(function(fileEntry) {
						zipFileEntry = fileEntry;
						writer = new zip.FileWriter(zipFileEntry);
						getData();
					});
				}
			}
		};
	})();

	//Code Change is required from here
	(function() {
		//console.log("hi");
		var fileInput = document.getElementById("file-input");
		var creationMethodInput = document.getElementById("creation-method-input");
		//console.log(creationMethodInput.value);
		function getResponse(entry, li, a,extension,fileName) {
			//console.log(entry,"hi");
			model.getEntryFile(entry, creationMethodInput.value, function(blobURL) {
					console.log(extension,check_for_only_html);
					if((extension === 'html' || extension === 'htm') && check_for_only_html === 0){
						console.log("hi");
  						file_name_html_blob_url.push({fname: fileName, url: blobURL});
					}
					else if(extension !== 'html' && extension !== 'htm'){
  						required_cnt++;
  						var request = new XMLHttpRequest();
						request.open('GET',blobURL, true);
						request.responseType = 'blob';
						request.onload = function() {
  						  var reader = new FileReader();
    					  reader.readAsDataURL(request.response);
    					  reader.onload =  function(e){
        					var blob_object = dataURItoBlob(e.target.result);//Sending DataUrl
        					uploadFileToIPFS(blob_object,fileName,extension);
    					};
					};
						  request.send();
					}
			});
		}

		function getOnlyHtmlResponse(entry, li, a,extension,fileName) {
			//console.log(entry,"hi");
			model.getEntryFile(entry, creationMethodInput.value, function(blobURL) {
				file_name_html_blob_url.push({fname: fileName, url: blobURL});
				html_entry_cnt++;
				if(html_entry_cnt === entries_length)
					handle_update_files();
			});
		}

		if (typeof requestFileSystem == "undefined")
			creationMethodInput.options.length = 1;
		//console.log("hel");
		fileInput.addEventListener('change', function() {
			//console.log("Hello");
			fileInput.disabled = true;
		// 	var flag=0;
		// 	model.getEntries(fileInput.files[0], function(entries) {
		// 		entries.forEach(function(entry) {
		// 			var a = document.createElement("a");
		// 			var dirName = a.text.split('/');
		// 			console.log("UPPER");
		// 			console.log(dirName);
		// 			var changedFileName = getChangedFileName(dirName);
		// 			if(changedFileName=="index.html"){
		// 				flag=1;
		// 			}
		// 	});
		// });		$('.fileListDuringUpload').show();
		$('.fileListDuringUpload').addClass('opened1');
			// if(checkForIndex(model,fileInput)){
			model.getEntries(fileInput.files[0], function(entries) {
				console.log('entries', entries);
				entries_length = entries.length;
				console.log(entries.length);
				var xcounter=0;
				entries.forEach(function(entry) {
					// $("#mainLoading").show();
					// $("#portal").hide();
					var li = document.createElement("li");
					var a = document.createElement("a");
					//Code Begins From Here
					a.textContent = entry.filename;
					a.href = "#";

					var dirName = a.text.split('/');
					console.log(a.text);
					// $("#fileBeingUploadedList").append("<p>"+a.text.substr(a.text.indexOf("/")+1)+"</p>");
					// $("#fileBeingUploadedList").append("<p>"+a.text+"</p>");
					var changedFileName = getChangedFileName(dirName);
					console.log("HEALLO",changedFileName);
					var dirLength = dirName.length;
					var extension = dirName[dirLength-1].toLowerCase().split('.');

					if(extension.length > 1){
						xcounter+=1;
						var extension = extension[extension.length-1].toLowerCase();
						if(extension === 'htm' || extension === 'html')
							html_entry_cnt++;
						console.log(extension);
						ycounter=0;
						$("#fileBeingUploadedList").append("<div style='height:25px;margin-top:10px;'>"+a.text+"</div>");
						$("#loadingConfirmation").append("<div style='height:25px;margin-top:10px;'><i  id='fileNumber"+String(xcounter)+"' class='fa fa-clock-o' style='color:red;'></i></div>");
						li.appendChild(a);
						getResponse(entry,li,a,extension,changedFileName);
					}
					else
						entries_length -= 1;

				});
				console.log("entries length="+entries_length+" "+html_entry_cnt);
				if(entries_length === html_entry_cnt)
					{
						check_for_only_html = 1;
						file_name_html_blob_url = [];
						html_entry_cnt = 0;
						console.log("Only Html",entries_length);
						entries.forEach(function(entry) {
			
						var li = document.createElement("li");
						var a = document.createElement("a");
						//Code Begins From Here
						a.textContent = entry.filename;
						a.href = "#";

						var dirName = a.text.split('/');
						console.log(a.text);
						// $("#fileBeingUploadedList").append("<p>"+a.text.substr(a.text.indexOf("/")+1)+"</p>");
						// $("#fileBeingUploadedList").append("<p>"+a.text+"</p>");
						var changedFileName = getChangedFileName(dirName);
					
						var dirLength = dirName.length;
						var extension = dirName[dirLength-1].toLowerCase().split('.');

						if(extension.length > 1){
							var extension = extension[extension.length-1].toLowerCase();
							li.appendChild(a);
							getOnlyHtmlResponse(entry,li,a,extension,changedFileName);
							}
						});
					}
		});
		// }else{
		// 	alert("Uploaded Files doesn't contain index.html");
		// }
		}, false);
	})();
	// load_Files();
})(this);

// //This function gets triggered when CreateWebsite button is clicked on portal.html
// function createWebsiteDisplay(){
// 	$("#domainInfo").html("<form onSubmit='checkDomainAvaibility(); return false;' role='form'><input type='text' id='websiteName' placeholder='Website Name' required /><button class='btn btn-primary' style='margin-left:20px' type='submit'>Check Availability</button></form> ");
// }

//To hide MainLoadingGif and display portal contents
function mainLoadingHide(){
	$("#mainLoading").hide();
	$("#portal").show();
	$("#creatWebsiteForm").show();
}

$(function() {
  $(window).load(function() {
    init();
  })
});

