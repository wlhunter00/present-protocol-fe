// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

contract PresentProtocol is ERC721, ERC721Holder, ERC1155Holder, Ownable {
    bytes4 constant _INTERFACE_ID_ERC721 = 0x80ac58cd;
    bytes4 constant _INTERFACE_ID_ERC1155 = 0xd9b67a26;

    string  public baseURI;
    uint256 public currentId;
    mapping(uint256 => Present) public presents;

    struct Present {
        address nftContract;
        uint256 tokenId;
    }

    error InvalidContract();
    error NotAuthorized();

    event Wrapped(address indexed _nftContract, uint256 indexed _tokenId, address indexed _gifter, address _receiver, uint256 _presentId);
    event Unwrapped(address indexed _nftContract, uint256 indexed _tokenId, address indexed _receiver, uint256 _presentId);

    constructor() ERC721("PresentProtocol", "PRESENT") {}

    function wrap(address _nftContract, uint256 _tokenId, address _to) external {
        if (ERC165Checker.supportsInterface(_nftContract, _INTERFACE_ID_ERC721)) {
            IERC721(_nftContract).safeTransferFrom(msg.sender, address(this), _tokenId);
        } else if (ERC165Checker.supportsInterface(_nftContract, _INTERFACE_ID_ERC1155)) {
            IERC1155(_nftContract).safeTransferFrom(msg.sender, address(this), _tokenId, 1, "");
        } else {
            revert InvalidContract();
        }

        presents[++currentId] = Present(_nftContract, _tokenId);
        _safeMint(_to, currentId);

        emit Wrapped(_nftContract, _tokenId, msg.sender, _to, currentId);
    }

    function unwrap(uint256 _presentId) external {
        if (ownerOf(_presentId) != msg.sender) revert NotAuthorized();
        Present memory present = presents[_presentId];
        address nftContract = present.nftContract;
        uint256 tokenId = present.tokenId;

        _burn(_presentId);
        delete presents[_presentId];

        if (ERC165Checker.supportsInterface(nftContract, _INTERFACE_ID_ERC721)) {
            IERC721(nftContract).safeTransferFrom(address(this), msg.sender, tokenId);
        } else {
            IERC1155(nftContract).safeTransferFrom(address(this), msg.sender, tokenId, 1, "");
        }

        emit Unwrapped(nftContract, present.tokenId, msg.sender, _presentId);
    }

    function setBaseURI(string calldata _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC1155Receiver) returns (bool) {
        return interfaceId == type(IERC1155Receiver).interfaceId || super.supportsInterface(interfaceId);
    }
}
