import Container from '@mui/material/Container';
import { SelectNFT } from '../components/selectNFT';
import MyPresents from '../components/myPresents';
import { useDynamicContext } from '@dynamic-labs/sdk-react';


export default function Home() {
  const { user } = useDynamicContext();

  return (
    <>
      <div>
        <Container style={{ textAlign: 'center' }}>
          <h1 className="title">The Present Protocol</h1>
          <p className="body">
            Happy Holidays! Wrap your NFTs and send your wrapped present(s) to
            your friends and family. If you’ve received a present then simply
            unwrap them to receive your gift!
          </p>
        </Container>

        {user && <MyPresents />}
        <SelectNFT />
      </div>
    </>
  );
}
