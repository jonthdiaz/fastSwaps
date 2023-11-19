// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";
import {IPoolManager} from "@uniswap/v4-core/contracts/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/contracts/types/PoolKey.sol";
import {PoolSwapTest} from "@uniswap/v4-core/contracts/test/PoolSwapTest.sol";
import {TickMath} from "@uniswap/v4-core/contracts/libraries/TickMath.sol";
import {CurrencyLibrary, Currency} from "@uniswap/v4-core/contracts/types/Currency.sol";
import {IHooks} from "@uniswap/v4-core/contracts/interfaces/IHooks.sol";

contract SwapScript is Script {
    // PoolSwapTest Contract address on Goerli
    PoolSwapTest swapRouter = PoolSwapTest(0x24C731645ee1e35C3219153d370EBd79784D1E91);

    address constant MUNI_ADDRESS = address(0xA50dbEF646ff79805E961e14aCceEAA9A41820eb); //-- insert your own contract address here -- mUNI deployed to GOERLI
    address constant MUSDC_ADDRESS = address(0x5F07F85de6587e1138ECfcA6992e4930b5fea820); //-- insert your own contract address here -- mUSDC deployed to GOERLI
    address constant HOOK_ADDRESS = address(0x3cA93aB169D85A16C6cfDF6cE3ACFEE1Fe0599a3); // address of the hook contract deployed to goerli -- you can use this hook address or deploy your own!

    // slippage tolerance to allow for unlimited price impact
    uint160 public constant MIN_PRICE_LIMIT = TickMath.MIN_SQRT_RATIO + 1;
    uint160 public constant MAX_PRICE_LIMIT = TickMath.MAX_SQRT_RATIO - 1;

    function run() external {
        address token0 = uint160(MUSDC_ADDRESS) < uint160(MUNI_ADDRESS) ? MUSDC_ADDRESS : MUNI_ADDRESS;
        address token1 = uint160(MUSDC_ADDRESS) < uint160(MUNI_ADDRESS) ? MUNI_ADDRESS : MUSDC_ADDRESS;
        uint24 swapFee = 4000;
        int24 tickSpacing = 10;

        // Using a hooked pool
        PoolKey memory pool = PoolKey({
            currency0: Currency.wrap(token0),
            currency1: Currency.wrap(token1),
            fee: swapFee,
            tickSpacing: tickSpacing,
            hooks: IHooks(HOOK_ADDRESS)
        });

        // approve tokens to the swap router
        vm.broadcast();
        IERC20(token0).approve(address(swapRouter), type(uint256).max);
        vm.broadcast();
        IERC20(token1).approve(address(swapRouter), type(uint256).max);

        // ---------------------------- //
        // Swap 100e18 token0 into token1 //
        // ---------------------------- //
        bool zeroForOne = true;
        IPoolManager.SwapParams memory params = IPoolManager.SwapParams({
            zeroForOne: zeroForOne,
            amountSpecified: 100e18,
            sqrtPriceLimitX96: zeroForOne ? MIN_PRICE_LIMIT : MAX_PRICE_LIMIT // unlimited impact
        });

        // in v4, users have the option to receieve native ERC20s or wrapped ERC1155 tokens
        // here, we'll take the ERC20s
        PoolSwapTest.TestSettings memory testSettings =
            PoolSwapTest.TestSettings({withdrawTokens: true, settleUsingTransfer: true});

        bytes memory hookData = new bytes(0);
        vm.broadcast();
        swapRouter.swap(pool, params, testSettings, hookData);
    }
}
