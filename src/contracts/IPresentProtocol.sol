// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

struct Present {
    address nftContract;
    uint96 duration;
    uint256 tokenId;
}

interface IPresentProtocol {
    error InvalidContract();
    error NotAuthorized();
    error TimeNotElapsed();

    event Wrapped(
        address indexed _nftContract,
        uint256 indexed _tokenId,
        address indexed _gifter,
        address _receiver,
        uint256 _presentId,
        uint96 _duration
    );

    event Unwrapped(
        address indexed _nftContract,
        uint256 indexed _tokenId,
        address indexed _receiver,
        uint256 _presentId
    );

    function baseURI() external view returns (string memory);

    function currentId() external view returns (uint256);

    function presents(uint256) external view returns (address nftContract, uint96 duration, uint256 tokenId);

    function unwrap(uint256 _presentId) external;

    function wrap(
        address _nftContract,
        uint256 _tokenId,
        uint96 _duration,
        address _to
    ) external;
}
