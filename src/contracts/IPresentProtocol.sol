// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

interface IPresentProtocol {
    error InvalidContract();
    error NotAuthorized();
    error TimeNotElapsed();

    event Wrapped(
        address indexed _gifter,
        address indexed _receiver,
        uint256 indexed _presentId,
        bytes _present
    );

    event Unwrapped(
        address indexed _receiver,
        address indexed _nftContract,
        uint256 indexed _tokenId,
        uint256 _presentId
    );

    function baseURI() external view returns (string memory);

    function currentId() external view returns (uint256);

    function encode(
        address _nftContract,
        uint256 _tokenId,
        uint256 _duration,
        string memory _message
    ) external pure returns (bytes memory gift);

    function presents(uint256) external view returns (bytes memory);

    function setBaseURI(string calldata _baseURI) external payable;

    function unwrap(uint256 _presentId) external;

    function wrap(bytes calldata _gift, address _to) external;
}
