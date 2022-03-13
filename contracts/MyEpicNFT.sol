pragma solidity ^0.8.1;

// We need some util functions for strings.
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

import {Base64} from "./Libraries/Base64.sol";


contract MyEpicNFT is ERC721URIStorage {
	using Counters for Counters.Counter;
	Counters.Counter private _tokenIds;
	event NewEpicNFTMinted(address sender, uint256 tokenId);

	constructor() ("testToken", "TTK")
	{
		console.log("Smart Contract Deployed");
	}

	function makeAnEpicNFT(string memory metaData) public {
		
		uint256 newItemId = _tokenIds.current();

		require(newItemId < 50, "Max number of NFTs allowed");
	
		_safeMint(msg.sender, newItemId);
	
		string memory metaDataString = "{
          "name" : "A Name",
          "image" : url,
          "description" : "A description"
        }";

		// Update your URI!!!
		_setTokenURI(newItemId, metaDataString);
	
		_tokenIds.increment();

		emit NewEpicNFTMinted(msg.sender, newItemId);

	}


}