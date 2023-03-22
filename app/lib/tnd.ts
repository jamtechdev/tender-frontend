import type { Signer, Contract, BigNumber, BigNumberish, ContractTransaction } from "ethers";
import type { TransactionReceipt } from "@ethersproject/providers";
import type { IncentiveTracker, IncentiveToken } from "~/types/global";

import { ethers } from "ethers";
// import { getArbitrumOneSdk } from "@dethcrypto/eth-sdk-client";
import { getMainnetSdk } from '@dethcrypto/eth-sdk-client'

import { Tendies } from "~/config/networks/arbitrum"
import rewardTrackerAbi from "~/config/sample-reward-tracker-abi"
import rewardTokenAbi from "~/config/sample-reward-token-abi"
import { Address } from "@dethcrypto/eth-sdk";

export const TND_DECIMALS = Tendies.Tokens.TND.decimals

interface Txn {
  wait: (n?: number) => TransactionReceipt;
  hash: string;
}

const UINT_MAX = ethers.constants.MaxUint256
const { Trackers, Tokens } = Tendies

const getToken = (token: IncentiveToken) => Tokens[token]
const getTracker = (tracker: IncentiveTracker) => Trackers[tracker]
const getTokenTracker = (token: IncentiveToken) => getTracker(getToken(token).tracker)

const getTrackerContract = (contractName: IncentiveTracker, signer: Signer): Contract => {
  const address = getTracker(contractName).address;
  return new ethers.Contract(address, rewardTrackerAbi, signer)
}

const getTokenContract = (contractName: IncentiveToken, signer: Signer): Contract => {
  const address = getToken(contractName).address;
  return new ethers.Contract(address, rewardTokenAbi, signer)
}

export const getClaimable = async (token: IncentiveToken, signer: Signer): Promise<BigNumber> => {
  const trackerContract = getTrackerContract(getToken(token).tracker, signer)
  return trackerContract.claimable(await signer.getAddress());
}

export const enable = async (token: IncentiveToken, signer: Signer): Promise<Txn> => {
  const tokenContract = getTokenContract(token, signer);
  const trackerAddress = getTokenTracker(token).address
  return tokenContract.approve(trackerAddress, UINT_MAX)
}

export const stakeTnd = async (signer: Signer, amount: BigNumber): Promise<ContractTransaction> => {
  let sdk = getArbitrumOneSdk(signer)
  return sdk.RewardRouter.stakeTnd(amount)
}

export const stakeEsTnd = async (signer: Signer, amount: BigNumberish): Promise<ContractTransaction> => {
  let sdk = getArbitrumOneSdk(signer)
  return sdk.RewardRouter.stakeEsTnd(amount)
}

export const unstakeTnd = async (signer: Signer, amount: BigNumber): Promise<ContractTransaction> => {
  let sdk = getArbitrumOneSdk(signer)
  return sdk.RewardRouter.unstakeTnd(amount)
}

export const unstakeEsTnd = async (signer: Signer, amount: BigNumberish): Promise<ContractTransaction> => {
  let sdk = getArbitrumOneSdk(signer)
  return sdk.RewardRouter.unstakeEsTnd(amount)
}

export const claimRewards = async (signer: Signer): Promise<ContractTransaction> => {
  // returns unclaimed supply / borrow incentives
  let sdk = getArbitrumOneSdk(signer);
  return sdk.Comptroller["claimComp(address)"](await signer.getAddress())
}

export const getESTNDBalance = async (signer: Signer): Promise<BigNumber> => {
  let sdk = getArbitrumOneSdk(signer)
  return sdk.esTND.balanceOf(await signer.getAddress());
}

export const compound = async (signer: Signer): Promise<ContractTransaction> => {
  let sdk = getArbitrumOneSdk(signer)
  return sdk.RewardRouter.handleRewards(false, false, true, true, true, true, true)
}

export const claim = async (signer: Signer): Promise<ContractTransaction> => {
  let sdk = getArbitrumOneSdk(signer)
  return sdk.RewardRouter.handleRewards(false, false, true, false, false, true, true)
}

export const claimEsTnd = async (signer: Signer): Promise<ContractTransaction> => {
  let sdk = getArbitrumOneSdk(signer)
  return sdk.RewardRouter.handleRewards(true, false, true, false, false, true, true)
}

export const claimFees = async (signer: Signer): Promise<ContractTransaction> => {
  let sdk = getArbitrumOneSdk(signer)
  return sdk.RewardRouter.claimFees()
}

export const depositESTND = async (signer: Signer, amount: BigNumber): Promise<ContractTransaction> => {
  let sdk = getArbitrumOneSdk(signer)
  return sdk.vTND.deposit(amount)
}

export const withdrawESTND = async (signer: Signer): Promise<ContractTransaction> => {
  let sdk = getArbitrumOneSdk(signer)
  return sdk.vTND.withdraw()
}

export const getTNDIncentives = async (signer: Signer, cToken: Address): Promise<BigNumber> => {
  let sdk = getArbitrumOneSdk(signer)
  return sdk.Comptroller.compSpeeds(cToken)
}

export async function quotePriceInUSDC(): Promise<number> {
  // try the server and fallback to coingecko
  try {
    let response = await fetch(`https://api.tender.fi/api/tnd_price`)
    let json = await response.json() as { "usd": number }
    return json.usd
  } catch (e) {
    let contract = Tendies.Tokens.TND.address
    let response = await fetch(`https://api.coingecko.com/api/v3/simple/token_price/arbitrum-one?contract_addresses=${contract}&vs_currencies=usd`)
    let json = await response.json() as { [contract: string]: { "usd": number } }
    let usd = json[contract].usd
    return usd
  }
}

export const getAllData = async (signer: Signer) => {
  let sdk = getArbitrumOneSdk(signer)
  let address = signer.getAddress()
  let vestedTND = sdk.vTND.getVestedAmount(address)

  const dataPromises = {
    TNDBalance: sdk.TND.balanceOf(address),
    esTNDBalance: sdk.esTND.balanceOf(address),
    bnBalance: sdk.bnTND.balanceOf(address),

    totalTNDSupply: sdk.TND.totalSupply(),
    totalTNDStaked: sdk.sTND.totalDepositSupply(sdk.TND.address),

    totalESTNDSupply: sdk.esTND.totalSupply(),
    totalESTNDStaked: sdk.sTND.totalDepositSupply(sdk.esTND.address),

    stakedTND: sdk.sTND.depositBalances(address, sdk.TND.address),
    stakedESTND: sdk.sTND.depositBalances(address, sdk.esTND.address),
    stakedBonusPoints: sdk.sbfTND.depositBalances(address, sdk.bnTND.address),

    // bonus points are multiplier points
    // bonus points = depositbalancesTND
    // boostPercentage: MP / bonusPoints+amountstaked // : 100 * (4.5656) / (7.54 + 2.00) = 47.85%

    claimableBonusPoints: sdk.sbTND.claimable(address),
    claimableESTND: sdk.sTND.claimable(address),
    claimableFees: sdk.sbfTND.claimable(address),

    sTNDAllowance: sdk.TND.allowance(address, sdk.sTND.address),
    sESTNDAllowance: sdk.esTND.allowance(address, sdk.sTND.address),

    // an interval is a block
    emissionsPerBlock: sdk.sTND.tokensPerInterval(),
    stakedAmounts: sdk.sbfTND.stakedAmounts(address),
    ethEmissionsPerSecond: sdk.EthRewardDistributor.tokensPerInterval(),

    // Vester
    // claimableTND: sdk.v
    vestedTND: vestedTND,
    claimableTND: sdk.vTND.claimable(address),
    claimedTND: sdk.vTND.claimedAmounts(address),
    vTNDAllowance: sdk.esTND.allowance(address, sdk.vTND.address),
    maxVestableAmount: sdk.vTND.getMaxVestableAmount(address),
    reservedForVesting: vestedTND.then((tnd) => sdk.vTND.getPairAmount(address, tnd))
  }

  await Promise.all(Object.values(dataPromises))

  type Datum = keyof typeof dataPromises
  let data: Record<Datum, BigNumber> = Object.create(dataPromises)

  // await all the promises for the return objet
  for (const [key, value] of Object.entries(dataPromises)) {
    data[key as Datum] = await value
  }

  return data;

}
