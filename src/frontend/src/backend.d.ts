import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PlatformConnection {
    id: bigint;
    owner: Principal;
    name: string;
    apiKey: string;
    apiSecret: string;
    platformType: PlatformType;
}
export interface Payment {
    status: PaymentStatus;
    description: string;
    currency: string;
    payee: Principal;
    payer: Principal;
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createConnection(name: string, platformType: PlatformType, apiKey: string, apiSecret: string): Promise<bigint>;
    /**
     * / Create a new payment request with currency
     */
    createPayment(payee: Principal, amount: bigint, currency: string, description: string): Promise<bigint>;
    deleteConnection(id: bigint): Promise<void>;
    getCallerConnections(): Promise<Array<PlatformConnection>>;
    /**
     * / Get the caller's user profile
     */
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConnection(id: bigint): Promise<PlatformConnection>;
    /**
     * / Get payment by id
     */
    getPayment(id: bigint): Promise<Payment>;
    /**
     * / Get a user's profile
     */
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / List all payments
     */
    listAllPayments(): Promise<Array<Payment>>;
    /**
     * / List all payments for a user
     */
    listPaymentsForUser(user: Principal): Promise<Array<Payment>>;
    /**
     * / Save the caller's user profile
     */
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateConnection(id: bigint, name: string, platformType: PlatformType, apiKey: string, apiSecret: string): Promise<void>;
    /**
     * / Update the status of a payment
     */
    updatePaymentStatus(id: bigint, status: PaymentStatus): Promise<void>;
}
