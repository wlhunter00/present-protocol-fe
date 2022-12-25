import Image from 'next/image';
import useMediaQuery from "@mui/material/useMediaQuery";

export function NFTCard(props) {
  const isDesktop = useMediaQuery("(min-width:600px)");

  return (
    <div className={isDesktop ? "image-card highlight-hover" : "image-card highlight-hover mobile-image"}>
      <Image
        loader={() => {
          return props.nft.image;
        }}
        src={props.nft.image}
        width={isDesktop ? 300 : 250}
        height={isDesktop ? 300 : 250}
        alt={props.nft.name}
      />

      <h2 className="card-title">{props.nft.name}</h2>
      <p className="card-description">{props.nft.collection_name} - {props.nft.token_id}</p>
    </div>
  );
}
