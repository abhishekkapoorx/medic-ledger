# MedicLedger

MedicLedger is a blockchain-based platform for pharmaceutical supply chain management, prescription tracking, and medical record verification. The system connects patients, doctors, manufacturers, distributors, and retailers in a secure, transparent network built on Ethereum blockchain technology.

## Project Structure

The project consists of two main components:
- **Next.js Frontend**: User interface and client-side application
- **Hardhat Blockchain**: Smart contracts and blockchain infrastructure

## Features

- User authentication with blockchain wallet integration
- Medical professional verification system
- Pharmaceutical supply chain tracking
- Digital prescription management
- Medical record verification using IPFS
- Medicine marketplace
- Dashboard analytics for all user roles

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MetaMask](https://metamask.io/) or similar Ethereum wallet browser extension

## Getting Started

### Frontend Setup (Next.js)

1. Clone the repository:
```bash
git clone [repository-url]
cd medic-ledger
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to access the application.

### Blockchain Setup (Hardhat)

1. Navigate to the blockchain directory:
```bash
cd sol_back
```

2. Install blockchain dependencies:
```bash
npm install
# or
yarn install
```

3. Compile smart contracts:
```bash
npx hardhat compile
```

4. Start a local blockchain node:
```bash
npx hardhat node
```

5. Deploy smart contracts to the local node (in a new terminal):
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

### Connecting Frontend to Blockchain

1. Connect MetaMask to your local Hardhat network:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`

2. Import test accounts using private keys provided by Hardhat node (shown in terminal output).

## Smart Contracts

The project includes the following key smart contracts:

- `UserRegistry.sol`: Manages user registration and role management
- `MedicineNFT.sol`: Handles medicine tracking as non-fungible tokens
- `PrescriptionNFT.sol`: Manages digital prescriptions as NFTs
- `MarketPlace.sol`: Facilitates medicine sales and transfers

## Hardhat Commands

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Start local blockchain node
npx hardhat node

# Deploy contracts to local network
npx hardhat run scripts/deploy.ts --network localhost

# Deploy contracts to a testnet (configure network in hardhat.config.ts first)
npx hardhat run scripts/deploy.ts --network [network-name]

# Verify contract on Etherscan (after deployment to public network)
npx hardhat verify --network [network-name] [contract-address] [constructor-arguments]
```

## IPFS Integration

Medical documents and licenses are stored on IPFS with Pinata gateway integration. Files can be accessed via the following URL pattern:
```
https://gateway.pinata.cloud/ipfs/[hash]
```

## Environment Setup

Create a `.env` file in both the root directory and `sol_back` directory for environment configurations:

Root `.env`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_PINATA_API_KEY=
NEXT_PUBLIC_PINATA_SECRET_KEY=
```

`sol_back/.env`:
```
ETHERSCAN_API_KEY=
PRIVATE_KEY=
```

## Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Contributors
[![contributors](https://contrib.rocks/image?repo=abhishekkapoorx/medic-ledger&max=2000)](https://github.com/abhishekkapoorx/medic-ledger/graphs/contributors)

## License

This project is licensed under the [MIT License](LICENSE).
