import axios from 'axios';
import {
  GIFT_CONTRACT_ADDRESS
} from "../../constants";

// (GET) all NFTs for a user
export default async function handler(req, res) {
  const userWallet = req.query.userWallet;

  try {
    const apiRequest = `https://testnets-api.opensea.io/api/v1/assets?owner=${userWallet}&asset_contract_address=${GIFT_CONTRACT_ADDRESS}`;
    const apiResponse = await axios.get(apiRequest, {
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip,deflate,compress',
        'Content-Type': 'application/json',
      },
    });

    let nfts = [];
    for (let i = 0; i < apiResponse.data['assets'].length; i++) {
      const currNFT = apiResponse.data['assets'][i];

      // TODO - get the gifter address somehow

      // if (currNFT['name'] && currNFT['description'] && currNFT['image_url']) {
      nfts.push({
        token_id: Number(currNFT['token_id']),
        collection_address: currNFT['asset_contract']['address'],
        collection_name: currNFT['asset_contract']['name'],
        name: currNFT['name'],
        description: currNFT['description'],
        image: currNFT['image_url'],
        schema: currNFT['asset_contract']['schema_name'],
      });
      // }
    }

    // console.log(nfts);
    res.status(200).json(nfts);
  } catch (error) {
    res.json(error);
  }
}
