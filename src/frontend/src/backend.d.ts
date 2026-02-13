import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface FundingRequest {
    method: {
        __kind__: "visa";
        visa: {
            cvv: string;
            card_number: string;
            card_holder: string;
            expiry: string;
        };
    } | {
        __kind__: "mastercard";
        mastercard: {
            cvv: string;
            card_number: string;
            card_holder: string;
            expiry: string;
        };
    } | {
        __kind__: "bank_account";
        bank_account: {
            bank_name: string;
            account_number: string;
            account_holder: string;
            routing_number: string;
        };
    };
    reference?: string;
    currency: Currency;
    amount: bigint;
}
export type Time = bigint;
export interface WalletBalance {
    currency: Currency;
    amount: bigint;
}
export type Currency = {
    __kind__: "bdt";
    bdt: null;
} | {
    __kind__: "btc";
    btc: null;
} | {
    __kind__: "eth";
    eth: null;
} | {
    __kind__: "usd";
    usd: null;
} | {
    __kind__: "other";
    other: string;
} | {
    __kind__: "usdt";
    usdt: Variant_op_bnb_etc_eth_star;
};
export interface CashOutRequest {
    destination: string;
    provider: Variant_upay_payoneer_nagad_bkash_rocket_paypal;
    reference?: string;
    currency: Currency;
    amount: bigint;
}
export interface Payment {
    id: bigint;
    status: PaymentStatus;
    description: string;
    currency: string;
    payee: Principal;
    payer: Principal;
    amount: bigint;
}
export type TransactionType = {
    __kind__: "transfer_out";
    transfer_out: null;
} | {
    __kind__: "deposit";
    deposit: null;
} | {
    __kind__: "transfer_in";
    transfer_in: null;
} | {
    __kind__: "withdrawal";
    withdrawal: null;
} | {
    __kind__: "funding";
    funding: null;
} | {
    __kind__: "cash_out";
    cash_out: {
        destination: string;
        provider: Variant_upay_payoneer_nagad_bkash_rocket_paypal;
    };
};
export interface Transaction {
    id: bigint;
    status: TransactionStatus;
    transactionType: TransactionType;
    owner: Principal;
    reference?: string;
    sender?: Principal;
    currency: Currency;
    timestamp: Time;
    amount: bigint;
    receiver?: Principal;
}
export interface PlatformConnection {
    id: bigint;
    owner: Principal;
    name: string;
    apiKey: string;
    apiSecret: string;
    platformType: PlatformType;
}
export interface InternalTransferRequestByPhone {
    reference?: string;
    currency: Currency;
    phoneNumber: string;
    amount: bigint;
}
export interface PersonalAccount {
    nid: string;
    taxId: string;
    password: string;
    fullName: string;
    email: string;
    address: string;
    phone: string;
}
export interface InternalTransferRequest {
    recipient: Principal;
    reference?: string;
    currency: Currency;
    amount: bigint;
}
export interface UserProfile {
    name: string;
}
export enum PaymentStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed"
}
export enum PlatformType {
    wordpress_woo = "wordpress_woo",
    otherPlatform = "otherPlatform",
    shopify = "shopify"
}
export enum TransactionStatus {
    pending = "pending",
    completed = "completed",
    failed = "failed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_op_bnb_etc_eth_star {
    op = "op",
    bnb = "bnb",
    etc = "etc",
    eth = "eth",
    star = "star"
}
export enum Variant_upay_payoneer_nagad_bkash_rocket_paypal {
    upay = "upay",
    payoneer = "payoneer",
    nagad = "nagad",
    bkash = "bkash",
    rocket = "rocket",
    paypal = "paypal"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createConnection(name: string, platformType: PlatformType, apiKey: string, apiSecret: string): Promise<bigint>;
    createPayment(payee: Principal, amount: bigint, currency: string, description: string): Promise<bigint>;
    createPaymentByPhone(phoneNumber: string, amount: bigint, currency: string, description: string): Promise<bigint>;
    deleteConnection(id: bigint): Promise<void>;
    getCallerConnections(): Promise<Array<PlatformConnection>>;
    getCallerPersonalAccount(): Promise<PersonalAccount | null>;
    getCallerTransactionHistory(): Promise<Array<Transaction>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCallerWalletBalance(): Promise<Array<WalletBalance>>;
    getConnection(id: bigint): Promise<PlatformConnection>;
    getPayment(id: bigint): Promise<Payment>;
    getPersonalAccount(user: Principal): Promise<PersonalAccount | null>;
    getTransactionHistory(user: Principal): Promise<Array<Transaction>>;
    getUserAccount(user: Principal): Promise<{
        walletBalances?: Array<WalletBalance>;
        personalAccount?: PersonalAccount;
        transactions?: Array<Transaction>;
        profile?: UserProfile;
    }>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWalletBalance(user: Principal): Promise<Array<WalletBalance>>;
    isCallerAdmin(): Promise<boolean>;
    listAllPayments(): Promise<Array<Payment>>;
    listAllUsers(): Promise<Array<{
        principal: Principal;
        personalAccount?: PersonalAccount;
        profile?: UserProfile;
    }>>;
    listPaymentsForUser(user: Principal): Promise<Array<Payment>>;
    processCashOut(request: CashOutRequest): Promise<bigint>;
    processInternalTransfer(transfer: InternalTransferRequest): Promise<bigint>;
    processInternalTransferByPhone(transfer: InternalTransferRequestByPhone): Promise<bigint>;
    resendAddMoneyOtp(referenceId: bigint): Promise<void>;
    saveCallerPersonalAccount(account: PersonalAccount): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    startAddMoney(request: FundingRequest): Promise<bigint>;
    updateConnection(id: bigint, name: string, platformType: PlatformType, apiKey: string, apiSecret: string): Promise<void>;
    updatePaymentStatus(id: bigint, status: PaymentStatus): Promise<void>;
    verifyAddMoney(referenceId: bigint, otp: bigint): Promise<bigint>;
}
