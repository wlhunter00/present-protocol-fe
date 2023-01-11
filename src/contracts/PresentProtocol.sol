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
    using Strings for uint160;
    using Strings for uint256;

    bytes4 constant _INTERFACE_ID_ERC721  = 0x80ac58cd;
    bytes4 constant _INTERFACE_ID_ERC1155 = 0xd9b67a26;

    string  public baseURI;
    uint256 public currentId;
    uint256 public fee;

    mapping(uint256 => bytes)  public  presents;
    mapping(uint256 => string) private messages;

    constructor() ERC721("Present Protocol", "GIFT") {}

    function wrap(bytes calldata _gift, address _to, string calldata _message) external payable {
        if (msg.value != fee) revert InvalidPayment();
        if (strlen(_message) > 280) revert InvalidMessage();

        bytes memory from = abi.encode(msg.sender);
        bytes memory present = abi.encodePacked(from, _gift);
        (, address nftContract, uint256 tokenId, ) = _decode(present);

        if (ERC165Checker.supportsInterface(nftContract, _INTERFACE_ID_ERC721)) {
            IERC721(nftContract).safeTransferFrom(msg.sender, address(this), tokenId);
        } else if (ERC165Checker.supportsInterface(nftContract, _INTERFACE_ID_ERC1155)) {
            IERC1155(nftContract).safeTransferFrom(msg.sender, address(this), tokenId, 1, "");
        } else {
            revert InvalidContract();
        }

        presents[++currentId] = present;
        messages[currentId] = _message;
        _safeMint(_to, currentId);

        emit Wrapped(msg.sender, _to, currentId, present);
    }

    function unwrap(uint256 _presentId) external {
        if (ownerOf(_presentId) != msg.sender) revert NotAuthorized();
        bytes memory present = presents[_presentId];
        (, address nftContract, uint256 tokenId, uint256 timelock) = _decode(present);
        if (timelock > block.timestamp) revert TimeNotElapsed();

        _burn(_presentId);
        delete presents[_presentId];
        delete messages[_presentId];

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

    function setFee(uint256 _fee) external payable onlyOwner {
        fee = _fee;
    }

    function withdraw(address payable _to) external payable onlyOwner {
        _to.transfer(address(this).balance);
    }

    function encode(
        address _nftContract,
        uint256 _tokenId,
        uint256 _timelock
    ) external pure returns (bytes memory gift) {
        gift = abi.encode(_nftContract, _tokenId, _timelock);
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

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireMinted(tokenId);
        string memory name = string.concat("Gift #", tokenId.toString());
        string memory url = string.concat("https://presentprotocol.xyz/", tokenId.toString());
        string memory image = baseURI;
        string memory message = messages[tokenId];
        bytes  memory present = presents[tokenId];
        (address from, , , uint256 timelock) = _decode(present);

        return string(abi.encodePacked('data:application/json;utf8,',
            '{"name":"',
                name,
            '",',
            '"description":"',
                message,
            '",',
            '"external_url":"',
                url,
            '",',
            '"image":"',
                image,
            '",',
            '"from":"',
                uint160(from).toHexString(20),
            '",',
            '"attributes": [{"display_type":"Date", "trait_type":"Unwrap", "value":"',
                timelock.toString(),
            '"}]}'
        ));
    }

    function strlen(string calldata _str) public pure returns (uint256 len) {
        uint256 i;
        uint256 bytesLength = bytes(_str).length;
        for (len; i < bytesLength; ++len) {
            bytes1 b = bytes(_str)[i];
            if (b < 0x80) {
                i += 1;
            } else if (b < 0xE0) {
                i += 2;
            } else if (b < 0xF0) {
                i += 3;
            } else if (b < 0xF8) {
                i += 4;
            } else if (b < 0xFC) {
                i += 5;
            } else {
                i += 6;
            }
        }
    }

    function _decode(bytes memory _present)
        internal
        pure
        returns (
            address from,
            address nftContract,
            uint256 tokenId,
            uint256 timelock
        )
    {
        (from, nftContract, tokenId, timelock) = abi.decode(
            _present,
            (address, address, uint256, uint256)
        );
    }
}
