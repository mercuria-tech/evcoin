EV Charging Platform – Blockchain & Token Integration Plan
This document outlines the full architecture, token model, and integration steps for adding blockchain and tokenization capabilities to the EV Charging Platform. It consolidates both technical and business requirements from the existing product and technical specifications.
1. Platform Architecture Overview
The EV Charging Platform operates under a hybrid EMP/CPO model, combining both charging infrastructure management and customer payment services. The architecture consists of five core layers: Hardware, Gateway/API, Frontend, Payment, and Blockchain Tokenization.

1. Hardware Layer: OCPP 1.6/2.0.1 compatible chargers with smart load management.
2. Gateway/API Layer: Real-time communication with chargers via WebSocket & RESTful APIs.
3. Frontend Layer: Mobile and web apps for user interaction (map, reservation, history, wallet).
4. Payment Layer: Supports fiat payments (IRR, AED) and blockchain payments (EVCH token).
5. Blockchain Layer: Solana SPL Token smart contracts for energy-to-token mapping and transparent transactions.

2. Tokenization Layer Architecture

The Tokenization Layer functions as an independent microservice integrated into the existing platform. It enables energy transactions, user rewards, and staking mechanisms linked to real-world energy delivery.


Core Components:
- Token Service: Handles minting, burning, transfers, and staking logic via Solana RPC.
- Wallet Service: Manages user and operator token balances (integrated with Phantom or internal wallet).
- Blockchain Gateway: Connects the platform backend with Solana network through APIs.
- Smart Contracts: Record 'Proof of Charge' events on-chain, mapping kWh consumption to tokens.
- Analytics Connector: Tracks token circulation, reward issuance, and energy-backed supply.

3. EVCH Token Model (Solana SPL Standard)

Token Name: EV Charge Token (EVCH)
Network: Solana Mainnet
Type: SPL Token (ERC20 equivalent)
Total Supply: Elastic (based on real energy consumption)
Backing: 1 EVCH ≈ 1 kWh of verified charging energy
Utility:
- Pay for EV charging sessions.
- Earn rewards for green/renewable charging.
- Stake tokens for fee discounts or operator access.
- Exchange EVCH ↔ USDC or SOL on Raydium/Jupiter DEX.

4. Integration Scenarios

1. Energy-to-Token Conversion: Each completed charging session mints EVCH tokens proportional to kWh consumed.
2. Reward Mechanism: Users earn EVCH when charging off-peak or via renewable energy.
3. Payment Gateway: Users can pay charging fees using EVCH; operators receive equivalent fiat or stablecoins.
4. Staking & Loyalty: Users/operators stake EVCH for reduced fees or governance participation.
5. Marketplace: Users can exchange or redeem EVCH for services within the ecosystem.

5. System Modifications for Blockchain Integration

- Payment Service: Add Token Gateway & Solana Wallet API endpoints.
- Transaction Database: Extend schema with token_transaction tables.
- API Gateway: Implement /api/v1/token/* routes.
- Analytics Service: Include energy-to-token tracking and reward statistics.
- Admin Dashboard: Manage minting, burning, and liquidity pool monitoring.

6. Tokenomics Overview

Total Supply: 1,000,000,000 EVCH

Distribution Plan:
- 40% User & Charging Rewards
- 20% Infrastructure Operators
- 15% R&D and Platform Development
- 10% Marketing and Adoption
- 10% Liquidity & Reserves
- 5% Team (24-month vesting)

Economic Model:
- Mint: Triggered by verified charging energy (kWh usage)
- Burn: When tokens are redeemed for services or discounts
- Market Price: Pegged to average kWh value or USDC rate

7. Development Roadmap

Phase 1 – MVP (3 months): Implement base platform with 1 test station and token smart contract.
Phase 2 – Pilot (6 months): Integrate Solana payments in 3–5 real stations in Iran (MAPNA/municipality partnership).
Phase 3 – Regional Expansion (9–12 months): Launch in UAE (DEWA/ENOC cooperation) with multi-currency support.
Phase 4 – Scaling: Offer SaaS model for third-party CPOs and enable DAO governance for token holders.

8. Innovation Features

- Energy-to-Token Bridge: Automatically converts consumed energy to blockchain tokens.
- Green Credit System: Reward users for charging with renewable energy.
- Shared Charger Economy: Allow private charger owners to share chargers for token-based revenue.
- Dynamic Pricing Smart Contracts: Adjust rates based on load and demand via blockchain.

9. Compliance and Future Steps

- Regulatory: Ensure compliance with energy sector and digital asset laws in Iran and UAE.
- AML/KYC: Integrate identity verification for token payments.
- Partnerships: MAPNA, DEWA, ENOC, and Solana Foundation for pilot implementations.
- Next Step: Detailed smart contract design and Solana devnet deployment.

