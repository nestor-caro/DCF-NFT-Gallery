var ContractAddress;
var ContractObject;
var ContractState;
var contractAddress = "0x9a7847a78c6f2677ef49a30c9013027e3a1b8527";

function checkWallet(){
	if(window.zilPay){
		return true;
	}else{
		return false;
	}
}

async function connectWallet(){
	return (await window.zilPay.wallet.connect());
}

function loadContract(contractAddr){
	try{
		return window.zilPay.contracts.at(contractAddr);
	}catch(err){
		console.log(err.message);
		return false;
	}
}

function onloadInit(){
	observer();
	console.clear();
}

async function loadGallery(flag){
	if(!ContractObject){
		alert("Please load contract first");
		return;
	}

	var gallery = document.querySelector("#gallery-container");
	gallery.innerHTML = "";

	tokenOwners = ContractState.token_owners;
	tokenUris = ContractState.token_uris;
	

	galleryCode = "";

	var currentAccountAddress = window.zilPay.wallet.defaultAccount.base16;

	for(i in tokenOwners){

		if(flag){
			if(tokenOwners[i].toUpperCase() !== currentAccountAddress.toUpperCase()){			
				continue;
			}
		}

		
		var transferBtn = "";
		if(tokenOwners[i].toUpperCase() == currentAccountAddress.toUpperCase()){			
			transferBtn = "<button  onclick='transferNFT(" + i + ")' class='btn btn-dark btn-info'>Transfer</button>"
		}		

		var BurnBtn = "";
		if(tokenOwners[i].toUpperCase() == currentAccountAddress.toUpperCase()){			
			BurnBtn = "<button onclick='BurnNFT(" + i + ")' class='btn btn-dark btn-info'>Burn</button>"
		}	

		
		var token_data = await fetch(tokenUris[i]);
		var metadata = await token_data.json();
		local_image = metadata.image.replace("https://ipfs.io/ipfs/", "");
		console.log(metadata);
		
		galleryCode += `
          <div id="dope-${i}" class="col-12 col-sm-6 col-lg-3">
            <div class="card mb-4 shadow p-2 bg-body rounded">
              <img class="card-img-top" src="./img/${local_image}" />
              <div class="card-caption col-12 p-0">
                <div class="card-body">
                  <div class="text-center fs-5 text-secondary mb-2 fw-bold">
                    <span>Token ID: ${i}</span>
                  </div>
                  <div class="text-center d-grid gap-2">
                    <a class="btn btn-dark btn-info" href="https://spardawallet.mypinata.cloud/ipfs/${local_image}" role="button">
                      IPFS
                    </a>
                    <a class="btn btn-dark btn-info" href="https://zilswap.io/arky/collections/zil1nfuy0fuvdun80m6f5vxfqycz0caphpf8tksmlt/${i}" role="button">
                      Arky
                    </a>
                    <a class="btn btn-dark btn-info" href="https://viewblock.io/zilliqa/address/zil1nfuy0fuvdun80m6f5vxfqycz0caphpf8tksmlt?txsType=nft&specific=${i}&network=mainnet" role="button">
                      ViewBlock
                    </a>
                    ${transferBtn}
                    ${BurnBtn}  
                  </div>
                </div>
              </div>
            </div>
          </div>
		`;

	}
	if(galleryCode == "") {
		galleryCode = `
		<div class=" mb-4 bg-warning rounded-3 mt-5">
            <div class="container-fluid py-4 text-center">
                <h1 class="display-5 fw-bold text-center">Dope Crew Friend not Detected</h1>
                <p class="fs-4 text-center">You can get one now on SpardaWallet and/or Arky. </br><span class="fw-ligther fs-6 fst-italic"> Note: You need <a class="text-secondary" href="https://zilpay.io/">Zilpay Wallet</a> to buy/sell on Zilliqa Blockchain.</span></p>
                <a class="btn btn-dark btn-lg btn" role="button" href="https://www.spardawallet.com/marketsearch.html?9a7847a78c6f2677ef49a30c9013027e3a1b8527">Go to Sparda</a>
                <a class="btn btn-secondary btn-lg btn" role="button" href="https://zilswap.io/arky/collections/zil1nfuy0fuvdun80m6f5vxfqycz0caphpf8tksmlt">Go to Arky</a>
            </div>
        </div>
        `;
	}
	gallery.innerHTML = galleryCode;

}

async function connectAppToWallet(){
	check1 = checkWallet();
	check2 = await connectWallet();
	if(check1 && check2){
		//if successful hide button and show net and address
		document.querySelector("#wallet-address-container").style.display = "inline-block";
		document.querySelector("#connect-button-container").style.display = "none";

		//get and set address
		let currentAddress = window.zilPay.wallet.defaultAccount.bech32;
		document.querySelector("#wallet-address-span").innerHTML = truncate(currentAddress, 10);
		loadNFTContract();
	}else{
		//if connection failed 
		alert("Something went wrong connecting wallet, try again later.");
	}
}

function truncate(string, length){
	if(string.length > length)
		return string.substring(0,5)+'...'+string.substring(37,42)
}

function observer(){
	window.zilPay.wallet.observableAccount().subscribe(function (acc){
		if(acc) connectAppToWallet();
	});

	window.zilPay.wallet.observableNetwork().subscribe(function (net){
		if(net) connectAppToWallet();
	});
}


function loadNFTContract(){

	ContractObject = loadContract(contractAddress);
	if(ContractObject){
		ContractObject.getState().then(function(stateData){
			ContractState = stateData;
			ContractAddress = contractAddress;
			ContractObject.getInit().then(function(x){
				loadGallery(true);
			});

		});
	}else{
		ContractObject = undefined;
	}
}

async function BurnNFT(nftid) {

	var cancel = prompt("This process will BURN your DCF permanently from the Blockchain. If you would like to proceed write burn and click OK");
    if(cancel === null){
		return;
	}else if (cancel !== "burn"){
		alert("Process aborted");
		return;
	}

    var id = nftid.toString()
	const gasPrice = window.zilPay.utils.units.toQa('1000', window.zilPay.utils.units.Units.Li);

	var tx = await ContractObject.call(
	  'Burn',
	  [
	    {
	      vname: 'token_id',
	      type: 'Uint256',
	      value: id
	    }
	  ],
	  {
		gasPrice: gasPrice,
		gasLimit: window.zilPay.utils.Long.fromNumber(9000)
	  }, 
	true);

	console.log(tx);
	alert("You have burned your DCF, verify your transaction on ViewBlock");
}

async function transferNFT(nftid){

	var receiverAddress = prompt("Please enter the address you want to send NFT ID:" + nftid + " to");

	var id = nftid.toString()
	
	if (receiverAddress[0] == "z"){
    	receiverAddress = window.zilPay.crypto.fromBech32Address(receiverAddress)
	}

	/* Code for transaction call */
	const gasPrice = window.zilPay.utils.units.toQa('1000', window.zilPay.utils.units.Units.Li);

	var tx = await ContractObject.call('Transfer',[{
		vname: "to",
		type: "ByStr20",
		value: receiverAddress
	},{
		vname: "token_id",
		type: "Uint256",
		value: id
	}],
	{
		gasPrice: gasPrice,
		gasLimit: window.zilPay.utils.Long.fromNumber(9000)
	}, 
	true
	);
	
	console.log(tx);
	alert("You have sent your DCF Successfully, verify your transaction on ViewBlock");
}