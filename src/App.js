import React, {useState, useEffect} from 'react';
import './styles/App.css';
import {ethers} from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";
import {create, CID} from 'ipfs-http-client';
import { Buffer } from 'buffer';
// Constants
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;

const contractAddress = "0xf03E14AD564bb50115Ac105aD9131a6DF3622BDf";
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(contractAddress, myEpicNft.abi, signer);
const client = create('https://ipfs.infura.io:5001/api/v0')

const App = () => {

  const [selectedImage, setSelectedImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [urlArr, setUrlArr] = useState([]);

  const checkIfWalletIsConnected = async () => {
    
    if(provider)
    {
      const {ethereum} = window;
      const accounts = await ethereum.request({method: "eth_accounts"})

      
      if(accounts.length !== 0)
      {
        setCurrentAccount(accounts[0]);

        let chainId = await ethereum.request({method: "eth_chainId"});
        console.log("Connected chain: "+ chainId + " rinkeby");

        const rinkebyChainId = "0x4";
        if(rinkebyChainId !== chainId)
        {
          alert("You are not connected to the Rinkeby Network, please change the network from 'Ethereum Mainnet' to 'Rinkeby Test Network' in Metamask. (Settings > Advanced > Show test networks)");
          return;
        }
        
      }
    }
    else
    {
      console.log("ethereum object not found");
      return;
    }
  }

  const connectWallet = async () => {
    const {ethereum} = window;
    if(provider)
    {
      const accounts = await ethereum.request({method: "eth_requestAccounts"})

      if(accounts.length !== 0)
      {
        setCurrentAccount(accounts[0]);
      }
    }
    else
    {
      console.log("ethereum object not found");
      return;
    }
  }

  const makeAnNft = async() => {
    try {
      if(selectedImage && imageDescription && imageName)
      {
        const created = await client.add(selectedImage);
        const url = `https://ipfs.infura.io/ipfs/${created.path}`;
        setUrlArr(prev => [...prev, url]);
        console.log(url);

        const metadata = {"name" : imageName,"image" : url,"description" : imageDescription}
        const metadataString = JSON.stringify(metadata);
        const metadataURI = Buffer.from(metadataString).toString("base64");
        console.log(metadataURI)

        let nftTxn = await contract.makeAnEpicNFT(metadataURI);
        console.log("Minting NFT....")
        await nftTxn.wait();
    
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
  
        contract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
        	alert(`Hey there! We've minted your NFT. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${contractAddress}/${tokenId.toNumber()}`)
          console.log("https://testnets.opensea.io/assets/" + contractAddress + "/" + tokenId.toNumber());
        });
        
      }
      else{
        if(!selectedImage)
          alert("Set an image first");
        else if(!imageDescription)
          alert("Set an image description");
        else if(!imageName)  
          alert("Set an image name");
      }
    } catch (error) {
      console.log(error);
    }
  }
    
  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  useEffect(() => {checkIfWalletIsConnected();}, [])
  
  return (
    
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">NFT Collection</p>
          <p className="sub-text">
            Turn your image into an NFT! 
          </p>
          <p className="sub-text">
            You'll need metamask! Go ahead and get that here: https://metamask.io/download/
          </p>
          <p className="sub-text">
            After that, go here and get some Rinkeby ether for your wallet: https://www.rinkebyfaucet.com/
          </p>
          
          {
            currentAccount === "" ? (
            renderNotConnectedContainer()
            ) : (
            <button onClick={makeAnNft} className="cta-button connect-wallet-button">
              Mint NFT </button>
            )
          }
        </div>

        
        <div class="input-group">
              <input name="name" className="form-control" type="text" placeholder="Enter A Name for Your NFT" onChange={(event) => {
                    setImageName(event.target.value);
              }}/>
        </div>

        <div class="input-group">
          <input name="description" className="form-control" type="text" placeholder="Enter a Description for your NFT" onChange={(event) => {
              setImageDescription(event.target.value);}
              }/>
        </div>

        <div className="display">
        {urlArr.length !== 0
          ? urlArr.map((el) => <img src={el} alt="nfts" className="nfts" />)
        : <h3></h3>}
        </div>
          
          <input className="cta-button"
            type="file"
            name="myImage"
            onChange={(event) => {
              console.log(event.target.files[0]);
              setSelectedImage(event.target.files[0]);
            }}/>

            
            
      </div>
        
    </div>
  );
};
export default App;
