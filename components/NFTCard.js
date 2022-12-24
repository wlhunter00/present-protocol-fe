import { DynamicWidget } from '@dynamic-labs/sdk-react';
import Image from 'next/image';
import GiftLogo from '../public/gift.svg';
import { Grid, Snackbar, Alert } from '@mui/material';

export function NFTCard(props) {
  return (
    <div className="image-card highlight-hover">
      <Image
        loader={() => {
          return props.nft.image;
        }}
        src={props.nft.image}
        width={300}
        height={300}
        alt={props.nft.name}
      />

      <h2 className="card-title">{props.nft.name}</h2>
      <p className="card-description">{props.nft.collection_name} - {props.nft.token_id}</p>
    </div>
  );
}
