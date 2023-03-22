import { getMainnetSdk } from '@dethcrypto/eth-sdk-client' // yay, our SDK! It's tailored especially for our needs
import { ethers } from 'ethers'

async function main() {
    const mainnetProvider = ethers.getDefaultProvider('mainnet')
    const defaultSigner = ethers.Wallet.createRandom().connect(mainnetProvider)

    const sdk = getMainnetSdk(defaultSigner) // default signer will be wired with all contract instances
    // sdk is an object like { dai: DaiContract }

    const balance = sdk.dai.balanceOf(defaultSigner.address)
}

main()
    .then(() => console.log('DONE'))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })