import Image from 'next/image';
import useMediaQuery from "@mui/material/useMediaQuery";

export function NFTCard(props) {
  const isDesktop = useMediaQuery("(min-width:600px)");

  return (
    <>
      {props.unwrapped ?
        <div className={isDesktop ? "image-card-unwrapped highlight-hover" : "image-card-unwrapped highlight-hover mobile-image"}>
          <a
            target="_blank"
            href={`https://testnets.opensea.io/assets/goerli/${props.NFTAddress}/${props.NFTID}`}
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
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
          </a >
        </div>
        :
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
      }
    </>
  );
}
