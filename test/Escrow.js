const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    let buyer, seller, realEstate, inspector, lender, escrow

    beforeEach(async () => {
        [buyer, seller, inspector, lender] = await ethers.getSigners()

        const RealEstate = await ethers.getContractFactory('RealEstate')
        realEstate = await RealEstate.deploy()

        // console.log(signers)
        let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
        await transaction.wait()

        const Escrow = await ethers.getContractFactory('Escrow')
        escrow = await Escrow.deploy(realEstate.address, lender.address, inspector.address, seller.address)
    })
    describe('Deployment', async () => {

        it('Returns NFT address', async () => {
            let result = await escrow.nftAddress()
            expect(result).to.equal(realEstate.address)

        })

        it('Returns Seller address', async () => {
            const result = await escrow.seller()
            expect(result).to.equal(seller.address)
        })
        it('Returns Inspector address', async () => {
            const result = await escrow.inspector()
            expect(result).to.equal(inspector.address)
        })
        it('Returns Lender address', async () => {
            const result = await escrow.lender()
            expect(result).to.equal(lender.address)
        })

    })


})
