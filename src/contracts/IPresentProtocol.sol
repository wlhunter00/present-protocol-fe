// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface IPresentProtocol {
    error InvalidContract();
    error InvalidPayment();
    error NotAuthorized();
    error TimeNotElapsed();
    error TransferFailed();

    event Wrapped(
        address indexed _from,
        address indexed _to,
        uint256 indexed _presentId,
        bytes _present
    );

    event Unwrapped(
        address indexed _owner,
        address indexed _nftContract,
        uint256 indexed _tokenId,
        address _from,
        uint256 _presentId
    );

    function baseURI() external view returns (string memory);

    function currentId() external view returns (uint128);

    function encode(
        address _nftContract,
        uint256 _tokenId,
        uint256 _timelock
    ) external pure returns (bytes memory gift);

    function fee() external view returns (uint128);

    function presents(uint256) external view returns (bytes memory);

    function setBaseURI(string calldata _baseURI) external payable;

    function setFee(uint128 _fee) external payable;

    function unwrap(uint256 _presentId) external;

    function withdraw(address payable _to) external payable;

    function wrap(
        bytes calldata _gift,
        address _to,
        string calldata _message
    ) external payable;
}
