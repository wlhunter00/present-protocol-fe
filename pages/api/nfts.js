import axios from 'axios';

// (GET) all NFTs for a user
export default async function handler(req, res) {
  const userWallet = req.query.userWallet;

  try {
    const apiRequest = `https://testnets-api.opensea.io/api/v1/assets?owner=${userWallet}`;
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
      nfts.push({
        token_id: Number(currNFT['token_id']),
        collection_id: currNFT['asset_contract']['address'],
        name: currNFT['name'],
        description: currNFT['description'],
        image: currNFT['image_url'],
      });
    }

    console.log(nfts);
    res.status(200).json(nfts);
  } catch (error) {
    res.json(error);
  }
}
