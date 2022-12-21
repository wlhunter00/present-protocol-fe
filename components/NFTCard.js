import { DynamicWidget } from '@dynamic-labs/sdk-react';
import Image from 'next/image';
import GiftLogo from '../public/gift.svg';
import { Grid, Snackbar, Alert } from '@mui/material';

export function NFTCard({ nft }) {
  const isDesktop = true; // @Will

  return (
    <div className="custom-card">
      <Grid container spacing={2} direction={isDesktop ? 'row' : 'column'}>
        <Grid style={{ alignSelf: 'center' }} item xs={5}>
          <Image
            loader={() => {
              return nft.image;
            }}
            src={nft.image}
            width={300}
            height={300}
            alt={nft.name}
          />
        </Grid>
        <Grid item xs={7}>
          <h2 className="card-title">{nft.name}</h2>

          <p className="card-description">{nft.description}</p>
        </Grid>
      </Grid>
    </div>
  );
}
