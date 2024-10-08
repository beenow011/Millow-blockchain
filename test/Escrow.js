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

        transaction = await realEstate.connect(seller).approve(escrow.address, 1)
        await transaction.wait()

        transaction = await escrow.connect(seller).list(1, tokens(10), tokens(5), buyer.address)
        await transaction.wait()
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

    describe('Listing', async () => {

        it('Updates as listed', async () => {
            const result = await escrow.isListed(1)
            expect(result).to.equal(true)
        })

        it('Updates ownership', async () => {
            expect(await realEstate.ownerOf(1)).to.equal(escrow.address)

        })

        it('Returns buyer', async () => {
            const result = await escrow.buyer(1)
            expect(result).to.equal(buyer.address)

        })

        it('Returns purchase price', async () => {
            const result = await escrow.purchasePrice(1)
            expect(result).to.equal(tokens(10))

        })

        it('Returns escrow amount', async () => {
            const result = await escrow.escrowAmount(1)
            expect(result).to.equal(tokens(5))

        })



    })

    describe('Deposits', async () => {

        it('Updates contract balance', async () => {
            const transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5) })
            await transaction.wait()
            const result = await escrow.getBalance()
            expect(result).to.equal(tokens(5))
        })
    })

    describe('Inspection', async () => {

        it('Updates Inspection status', async () => {
            const transaction = await escrow.connect(inspector).updateInspectionStatus(1, true)
            await transaction.wait()
            const result = await escrow.inspectionPassed(1)
            expect(result).to.equal(true)
        })
    })

    describe('Approval', () => {
        beforeEach(async () => {
            let transaction = await escrow.connect(buyer).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(seller).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(lender).approveSale(1)
            await transaction.wait()
        })

        it('Updates approval status', async () => {
            expect(await escrow.approval(1, buyer.address)).to.be.equal(true)
            expect(await escrow.approval(1, seller.address)).to.be.equal(true)
            expect(await escrow.approval(1, lender.address)).to.be.equal(true)
        })
    })

})
