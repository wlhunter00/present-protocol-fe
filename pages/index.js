import Container from '@mui/material/Container';
import { textAlign } from '@mui/system';

export default function Home() {
  return (
    <>
      <div>
        <Container style={{ textAlign: "center" }}>
          <h1 className='title'>The Present Protocol</h1>
          <p>
            Happy Holidays! Wrap your NFTs and send your wrapped present(s) to your friends and family.
            If you’ve received a present then simply unwrap them to receive your gift!
          </p>
        </Container>
      </div>
    </>
  )
}
