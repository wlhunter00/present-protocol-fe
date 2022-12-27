// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

import "./IPresentProtocol.sol";

contract PresentProtocol is IPresentProtocol, ERC721, ERC721Holder, ERC1155Holder, Ownable {
    bytes4 constant _INTERFACE_ID_ERC721 = 0x80ac58cd;
    bytes4 constant _INTERFACE_ID_ERC1155 = 0xd9b67a26;

    string public baseURI;
    uint256 public currentId;
    mapping(uint256 => bytes) public presents;

    constructor() ERC721("PresentProtocol", "PRESENT") {}

    function wrap(address _to, bytes calldata _nftData) external {
        (address nftContract, uint256 tokenId, ) = _decode(_nftData);

        if (ERC165Checker.supportsInterface(nftContract, _INTERFACE_ID_ERC721)) {
            IERC721(nftContract).safeTransferFrom(msg.sender, address(this), tokenId);
        } else if (ERC165Checker.supportsInterface(nftContract, _INTERFACE_ID_ERC1155)) {
            IERC1155(nftContract).safeTransferFrom(msg.sender, address(this), tokenId, 1, "");
        } else {
            revert InvalidContract();
        }

        presents[++currentId] = _nftData;
        _safeMint(_to, currentId);

        emit Wrapped(msg.sender, _to, currentId, _nftData);
    }

    function unwrap(uint256 _presentId) external {
        if (ownerOf(_presentId) != msg.sender) revert NotAuthorized();
        (address nftContract, uint256 tokenId, uint256 duration) = _decode(presents[_presentId]);
        if (duration > block.timestamp) revert TimeNotElapsed();

        _burn(_presentId);
        delete presents[_presentId];

        if (ERC165Checker.supportsInterface(nftContract, _INTERFACE_ID_ERC721)) {
            IERC721(nftContract).safeTransferFrom(address(this), msg.sender, tokenId);
        } else {
            IERC1155(nftContract).safeTransferFrom(address(this), msg.sender, tokenId, 1, "");
        }

        emit Unwrapped(msg.sender, nftContract, tokenId, _presentId);
    }

    function setBaseURI(string calldata _baseURI) external payable onlyOwner {
        baseURI = _baseURI;
    }

    function encode(
        address _nftContract,
        uint256 _tokenId,
        uint256 _duration
    ) external pure returns (bytes memory data) {
        data = abi.encode(_nftContract, _tokenId, _duration);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC1155Receiver)
        returns (bool)
    {
        return
            interfaceId == type(IERC1155Receiver).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function _decode(bytes memory _data)
        internal
        pure
        returns (
            address nftContract,
            uint256 tokenId,
            uint256 duration
        )
    {
        (nftContract, tokenId, duration) = abi.decode(_data, (address, uint256, uint256));
    }
}
