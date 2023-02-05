import useSWR from 'swr';
import { NFTCard } from './NFTCard';

export default function DisplayGift(props) {
    const fetcher = (url) => fetch(url).then((r) => r.json());

    const { data: nft, error: nftError } = useSWR(
        (props.NFTID && props.NFTAddress) ? `/api/nft?token_id=${props.NFTID}&asset_contract_address=${props.NFTAddress}` : [],
        fetcher
    );

    return (
        <a
            target="_blank"
            href={`https://testnets.opensea.io/assets/goerli/${props.NFTAddress}/${props.NFTID}`}
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
        >
            {nft && <NFTCard unwrapped nft={nft} />}
        </a>
    )
}