import useSWR from 'swr';
import { NFTCard } from './NFTCard';

export default function DisplayGift(props) {
    const fetcher = (url) => fetch(url).then((r) => r.json());

    const { data: nft, error: nftError } = useSWR(
        (props.NFTID && props.NFTAddress) ? `/api/nft?token_id=${props.NFTID}&asset_contract_address=${props.NFTAddress}` : [],
        fetcher
    );

    return (
        <>
            {nft && <NFTCard unwrapped nft={nft} NFTAddress={props.NFTAddress} NFTID={props.NFTID} />}
        </>
    )
}