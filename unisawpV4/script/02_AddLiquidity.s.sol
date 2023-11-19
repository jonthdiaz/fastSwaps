// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";
import {IPoolManager} from "@uniswap/v4-core/contracts/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/contracts/types/PoolKey.sol";
import {PoolModifyPositionTest} from "@uniswap/v4-core/contracts/test/PoolModifyPositionTest.sol";
import {CurrencyLibrary, Currency} from "@uniswap/v4-core/contracts/types/Currency.sol";
import {IHooks} from "@uniswap/v4-core/contracts/interfaces/IHooks.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/contracts/types/PoolId.sol";

contract AddLiquidityScript is Script {
    using CurrencyLibrary for Currency;

    address constant GOERLI_POOLMANAGER = address(0xb673AE03413860776497B8C9b3E3F8d4D8745cB3); // pool manager deployed to GOERLI
    address constant MUNI_ADDRESS = address(0xA50dbEF646ff79805E961e14aCceEAA9A41820eb); // mUNI deployed to GOERLI -- insert your own contract address here
    address constant MUSDC_ADDRESS = address(0x5F07F85de6587e1138ECfcA6992e4930b5fea820); // mUSDC deployed to GOERLI -- insert your own contract address here
    address constant HOOK_ADDRESS = address(0x3cA93aB169D85A16C6cfDF6cE3ACFEE1Fe0599a3); // address of the hook contract deployed to goerli -- you can use this hook address or deploy your own!

    PoolModifyPositionTest lpRouter = PoolModifyPositionTest(address(0x30654C69B212AD057E817EcA26da6c5edA32E2E7));

    function run() external {
        // sort the tokens!
        address token0 = uint160(MUSDC_ADDRESS) < uint160(MUNI_ADDRESS) ? MUSDC_ADDRESS : MUNI_ADDRESS;
        address token1 = uint160(MUSDC_ADDRESS) < uint160(MUNI_ADDRESS) ? MUNI_ADDRESS : MUSDC_ADDRESS;
        uint24 swapFee = 4000; // 0.40% fee tier
        int24 tickSpacing = 10;

        PoolKey memory pool = PoolKey({
            currency0: Currency.wrap(token0),
            currency1: Currency.wrap(token1),
            fee: swapFee,
            tickSpacing: tickSpacing,
            hooks: IHooks(HOOK_ADDRESS)
        });

        // approve tokens to the LP Router
        vm.broadcast();
        IERC20(token0).approve(address(lpRouter), 1000e18);
        vm.broadcast();
        IERC20(token1).approve(address(lpRouter), 1000e18);

        // optionally specify hookData if the hook depends on arbitrary data for liquidity modification
        bytes memory hookData = new bytes(0);

        // logging the pool ID
        PoolId id = PoolIdLibrary.toId(pool);
        bytes32 idBytes = PoolId.unwrap(id);
        console.log("Pool ID Below");
        console.logBytes32(bytes32(idBytes));

        // Provide 10_000e18 worth of liquidity on the range of [-600, 600]
        vm.broadcast();
        lpRouter.modifyPosition(pool, IPoolManager.ModifyPositionParams(-600, 600, 10_000e18), hookData);
    }
}
