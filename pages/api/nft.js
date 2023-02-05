import axios from 'axios';

// (GET) all NFTs for a user
export default async function handler(req, res) {
  const asset_contract_address = req.query.asset_contract_address;
  const token_id = req.query.token_id;

  // console.log("apicall", token_id, asset_contract_address);

  try {
    const apiRequest = `https://testnets-api.opensea.io/api/v1/asset/${asset_contract_address}/${token_id}/`;
    const apiResponse = await axios.get(apiRequest, {
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip,deflate,compress',
        'Content-Type': 'application/json',
      },
    });

    const currNFT = apiResponse.data;
    let finalNFT = {};

    if (currNFT['name'] && currNFT['image_url']) {
      finalNFT = {
        token_id: Number(currNFT['token_id']),
        collection_address: currNFT['asset_contract']['address'],
        collection_name: currNFT['asset_contract']['name'],
        name: currNFT['name'],
        description: currNFT['description'],
        image: currNFT['image_url'],
        schema: currNFT['asset_contract']['schema_name'],
      };
    }
    console.log("api return", finalNFT);
    res.status(200).json(finalNFT);
  } catch (error) {
    res.json(error);
  }
}
