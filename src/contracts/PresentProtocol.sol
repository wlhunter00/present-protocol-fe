// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

import "./Base64.sol";
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
        (address from, address nftContract, uint256 tokenId, uint256 timelock) = _decode(present);
        if (timelock > block.timestamp) revert TimeNotElapsed();

        _burn(_presentId);
        delete presents[_presentId];
        delete messages[_presentId];

        if (ERC165Checker.supportsInterface(nftContract, _INTERFACE_ID_ERC721)) {
            IERC721(nftContract).safeTransferFrom(address(this), msg.sender, tokenId);
        } else {
            IERC1155(nftContract).safeTransferFrom(address(this), msg.sender, tokenId, 1, "");
        }

        emit Unwrapped(msg.sender, nftContract, tokenId, from, _presentId);
    }

    function setBaseURI(string calldata _baseURI) external payable onlyOwner {
        baseURI = _baseURI;
    }

    function setFee(uint256 _fee) external payable onlyOwner {
        fee = _fee;
    }

    function withdraw(address payable _to) external payable onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = _to.call{value: balance}("");
        if (!success) revert TransferFailed();
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
        string memory url = string.concat(baseURI, tokenId.toString());
        string memory image = Base64.encode(abi.encodePacked(_generateSVG()));
        string memory message = messages[tokenId];
        bytes  memory present = presents[tokenId];
        (address from, , , uint256 timelock) = _decode(present);

        return
            string.concat(
                "data:application/json;base64,",
                Base64.encode(
                    abi.encodePacked(
                        string.concat(
                            '{"name":"',
                                name,
                            '",',
                            '"description":"',
                                message,
                            '",',
                            '"external_url":"',
                                url,
                            '",',
                            '"image": "data:image/svg+xml;base64,',
                                image,
                            '",',
                            '"attributes": [{"display_type":"Date", "trait_type":"Unwrap", "value":"',
                                timelock.toString(),
                                '"}, {"trait_type":"From", "value":"',
                                uint160(from).toHexString(20),
                            '"}]}'
                        )
                    )
                )
            );
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

    function _generateSVG() internal pure returns (string memory) {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 675 637.5" xmlns:v="https://vecta.io/nano"><style><![CDATA[#B{animation:i28c 2s ease-in-out infinite;transform-origin:center}#A{animation:i19a 2s ease-in-out infinite;transform-origin:center}#E{animation:i16b 1s linear infinite;transform-origin:50% 50%}#D{animation:b 1s .3s linear infinite;transform-origin:50% 50%}#C{animation:c 1s .5s linear infinite;transform-origin:50% 50%}@keyframes i28c{0%{transform:scale(.5,.54)}100%{transform:scale(.5,.54)}} @keyframes i19a{0%{transform:rotateZ(0deg)}100%{transform:rotateZ(0deg)}} @keyframes i16b{0%{opacity:0}30%{opacity:0}50%{opacity:1}100%{opacity:0}} @keyframes b{0%{opacity:0}30%{opacity:0}50%{opacity:1}100%{opacity:0}} @keyframes c{0%{opacity:0}30%{opacity:0}50%{opacity:1}100%{opacity:0}} @keyframes i28c{0%{transform:scale(.5,.54)}100%{transform:scale(.5,.54)}} @keyframes i19a{0%{transform:rotateZ(0deg)}100%{transform:rotateZ(0deg)}} @keyframes i16b{0%{opacity:0}30%{opacity:0}50%{opacity:1}100%{opacity:0}} @keyframes b{0%{opacity:0}30%{opacity:0}50%{opacity:1}100%{opacity:0}} @keyframes c{0%{opacity:0}30%{opacity:0}50%{opacity:1}100%{opacity:0}}.B{stroke-linejoin:round}.C{stroke-width:25}.D{stroke:#f1ff6b}.E{stroke-linecap:round}]]></style><g id="A" class="B C"><g id="B" stroke="#54596e"><path d="M62.5,225h550V581.75A43.25,43.25,0,0,1,569.25,625H105.75A43.25,43.25,0,0,1,62.5,581.75Z" fill="#ff85a7"/><path d="M287.5 225h100v400h-100z" fill="#ffd5fa"/><path d="M93.62,112.5h487.5a81.12,81.12,0,0,1,81.38,80.86h0V225H12.5V193.62A81.12,81.12,0,0,1,93.62,112.5Z" fill="#1dbf73"/><g fill="#ffd5fa"><path d="M262.5 112.5h150V225h-150z"/><path d="M337.5 12.5h0A37.5 37.5 0 0 1 375 50v62.5h-75V50a37.5 37.5 0 0 1 37.5-37.5z"/><path d="M375,62.5h87.5a50,50,0,0,1,50,50H375Z"/><path d="M475.25 62.5l-50-50-50 50h100z"/><path d="M300,112.5H162.5a50,50,0,0,1,50-50H300Z"/><path d="M199.75 62.5l50-50 50 50h-100z"/></g></g></g><g id="C" fill="none" class="B C D E"><path d="M106.5 103l33 33"/><path d="M139.5 103l-33 33"/></g><g id="D" fill="none" class="B C D E"><path d="M535.5 147l33 33"/><path d="M568.5 147l-33 33"/></g><g id="E" fill="none" class="B C D E"><path d="M326.5 37l33 33"/><path d="M359.5 37l-33 33"/></g></svg>';
    }
}
