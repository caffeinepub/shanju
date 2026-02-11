import Map "mo:core/Map"; 
import Array "mo:core/Array"; 
import Order "mo:core/Order"; 
import Principal "mo:core/Principal"; 
import Runtime "mo:core/Runtime"; 
import Text "mo:core/Text"; 
import Nat "mo:core/Nat"; 
import Time "mo:core/Time"; 
import Iter "mo:core/Iter"; 
import Int "mo:core/Int"; 

import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization"; 
import AccessControl "authorization/access-control";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState(); 
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  public type PersonalAccount = {
    fullName : Text;
    address : Text;
    email : Text;
    phone : Text;
    taxId : Text;
    password : Text;
    nid : Text;
  };

  public type PaymentStatus = {
    #pending;
    #completed;
    #cancelled;
  };

  public type Payment = {
    payer : Principal;
    payee : Principal;
    amount : Nat;
    currency : Text;
    description : Text;
    status : PaymentStatus;
  };

  module Payment {
    public func compare(a : Payment, b : Payment) : Order.Order {
      Nat.compare(a.amount, b.amount);
    };
  };

  public type PlatformType = {
    #shopify;
    #wordpress_woo;
    #otherPlatform;
  };

  public type PlatformConnection = {
    id : Nat;
    owner : Principal;
    name : Text;
    platformType : PlatformType;
    apiKey : Text;
    apiSecret : Text;
  };

  public type Currency = {
    #usd;
    #bdt;
    #btc;
    #eth;
    #usdt : {
      #op;
      #eth;
      #bnb;
      #star;
      #etc;
    };
    #other : Text;
  };

  module Currency {
    public func compare(a : Currency, b : Currency) : Order.Order {
      switch (a, b) {
        case (#usd, #usd) { #equal };
        case (#usd, _) { #less };
        case (_, #usd) { #greater };
        case (#bdt, #bdt) { #equal };
        case (#bdt, _) { #less };
        case (_, #bdt) { #greater };
        case (#btc, #btc) { #equal };
        case (#btc, _) { #less };
        case (_, #btc) { #greater };
        case (#eth, #eth) { #equal };
        case (#eth, _) { #less };
        case (_, #eth) { #greater };
        case (#usdt(n1), #usdt(n2)) { if (n1 == n2) { #equal } else { #less } };
        case (#usdt(_), _) { #less };
        case (_, #usdt(_)) { #greater };
        case (#other(t1), #other(t2)) { Text.compare(t1, t2) };
      };
    };
  };

  public type TransactionType = {
    #deposit;
    #withdrawal;
    #transfer_in;
    #transfer_out;
    #funding;
    #cash_out : {
      provider : {
        #payoneer;
        #paypal;
        #bkash;
        #nagad;
        #rocket;
        #upay;
      };
      destination : Text;
    };
  };

  public type TransactionStatus = {
    #pending;
    #completed;
    #failed;
  };

  public type Transaction = {
    id : Nat;
    owner : Principal;
    amount : Nat;
    currency : Currency;
    transactionType : TransactionType;
    status : TransactionStatus;
    timestamp : Time.Time;
    reference : ?Text;
    sender : ?Principal;
    receiver : ?Principal;
  };

  public type WalletBalance = {
    currency : Currency;
    amount : Nat;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let personalAccounts = Map.empty<Principal, PersonalAccount>();
  let payments = Map.empty<Nat, Payment>();
  let connections = Map.empty<Nat, PlatformConnection>();
  var nextPaymentId = 1;
  var nextConnectionId = 1;

  let walletBalances = Map.empty<Principal, Map.Map<Currency, Nat>>();
  let transactions = Map.empty<Nat, Transaction>();
  var nextTransactionId = 1;

  // --- User Profile ---

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // --- Personal Account ---

  public query ({ caller }) func getCallerPersonalAccount() : async ?PersonalAccount {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access accounts");
    };
    personalAccounts.get(caller);
  };

  public query ({ caller }) func getPersonalAccount(user : Principal) : async ?PersonalAccount {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own personal account");
    };
    personalAccounts.get(user);
  };

  public shared ({ caller }) func saveCallerPersonalAccount(account : PersonalAccount) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create or update personal accounts");
    };
    personalAccounts.add(caller, account);
  };

  // --- Payments ---

  public shared ({ caller }) func createPayment(
    payee : Principal,
    amount : Nat,
    currency : Text,
    description : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create payments");
    };

    let id = nextPaymentId;
    nextPaymentId += 1;
    let payment : Payment = {
      payer = caller;
      payee;
      amount;
      currency;
      description;
      status = #pending;
    };
    payments.add(id, payment);
    id;
  };

  public query ({ caller }) func getPayment(id : Nat) : async Payment {
    switch (payments.get(id)) {
      case (null) { Runtime.trap("Payment with id " # id.toText() # " does not exist") };
      case (?payment) {
        if (caller != payment.payer and caller != payment.payee and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own payments");
        };
        payment;
      };
    };
  };

  public query ({ caller }) func listPaymentsForUser(user : Principal) : async [Payment] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own payments");
    };

    payments.values().filter(
      func(payment) {
        payment.payer == user or payment.payee == user;
      }
    ).toArray().sort();
  };

  public shared ({ caller }) func updatePaymentStatus(id : Nat, status : PaymentStatus) : async () {
    let payment = switch (payments.get(id)) {
      case (null) { Runtime.trap("Payment with id " # id.toText() # " does not exist") };
      case (?pmt) { pmt };
    };

    if (caller != payment.payer and caller != payment.payee and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the payer, payee, or an admin can update the payment status");
    };

    payments.add(id, {
      payment with
      status
    });
  };

  public query ({ caller }) func listAllPayments() : async [Payment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list all payments");
    };
    payments.values().toArray().sort();
  };

  // --- Wallet Ledger Functionality ---

  public type InternalTransferRequest = {
    recipient : Principal;
    amount : Nat;
    currency : Currency;
    reference : ?Text;
  };

  public type FundingRequest = {
    amount : Nat;
    currency : Currency;
    method : {
      #visa;
      #mastercard;
      #bank_account : {
        account_number : Text;
      };
    };
    reference : ?Text;
  };

  public type CashOutRequest = {
    amount : Nat;
    currency : Currency;
    provider : {
      #payoneer;
      #paypal;
      #bkash;
      #nagad;
      #rocket;
      #upay;
    };
    destination : Text;
    reference : ?Text;
  };

  func currencyEqual(a : Currency, b : Currency) : Bool {
    switch (a, b) {
      case (#usd, #usd) { true };
      case (#bdt, #bdt) { true };
      case (#btc, #btc) { true };
      case (#eth, #eth) { true };
      case (#usdt(n1), #usdt(n2)) { n1 == n2 };
      case (#other(t1), #other(t2)) { t1 == t2 };
      case _ { false };
    };
  };

  func getBalance(user : Principal, currency : Currency) : Nat {
    switch (walletBalances.get(user)) {
      case (null) { 0 };
      case (?userBalances) {
        switch (userBalances.get(currency)) {
          case (null) { 0 };
          case (?amount) { amount };
        };
      };
    };
  };

  func setBalance(user : Principal, currency : Currency, amount : Nat) {
    let userBalances = switch (walletBalances.get(user)) {
      case (null) { Map.empty<Currency, Nat>() };
      case (?existing) { existing };
    };
    userBalances.add(currency, amount);
    walletBalances.add(user, userBalances);
  };

  func recordTransaction(transaction : Transaction) {
    transactions.add(transaction.id, transaction);
    nextTransactionId += 1;
  };

  // Query wallet balance for authenticated caller
  public query ({ caller }) func getCallerWalletBalance() : async [WalletBalance] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view wallet balance");
    };

    switch (walletBalances.get(caller)) {
      case (null) { [] };
      case (?userBalances) {
        userBalances.entries().map(
          func((currency, amount)) : WalletBalance {
            { currency; amount };
          }
        ).toArray();
      };
    };
  };

  // Query transaction history for authenticated caller
  public query ({ caller }) func getCallerTransactionHistory() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view transaction history");
    };

    transactions.values().filter(
      func(tx) {
        tx.owner == caller;
      }
    ).toArray();
  };

  // Admin function to view any user's wallet balance
  public query ({ caller }) func getWalletBalance(user : Principal) : async [WalletBalance] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own wallet balance");
    };

    switch (walletBalances.get(user)) {
      case (null) { [] };
      case (?userBalances) {
        userBalances.entries().map(
          func((currency, amount)) : WalletBalance {
            { currency; amount };
          }
        ).toArray();
      };
    };
  };

  // Admin function to view any user's transaction history
  public query ({ caller }) func getTransactionHistory(user : Principal) : async [Transaction] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own transaction history");
    };

    transactions.values().filter(
      func(tx) {
        tx.owner == user;
      }
    ).toArray();
  };

  public shared ({ caller }) func processInternalTransfer(transfer : InternalTransferRequest) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can transfer");
    };
    if (transfer.amount == 0) {
      Runtime.trap("Invalid transfer amount. Must be greater than 0");
    };

    let senderBalance = getBalance(caller, transfer.currency);
    if (senderBalance < transfer.amount) {
      Runtime.trap("Insufficient funds for currency");
    };

    // Deduct from sender
    setBalance(caller, transfer.currency, senderBalance - transfer.amount);

    // Credit recipient
    let recipientBalance = getBalance(transfer.recipient, transfer.currency);
    setBalance(transfer.recipient, transfer.currency, recipientBalance + transfer.amount);

    // Record sender transaction
    let senderTxId = nextTransactionId;
    let senderTransaction : Transaction = {
      id = senderTxId;
      owner = caller;
      amount = transfer.amount;
      currency = transfer.currency;
      transactionType = #transfer_out;
      status = #completed;
      timestamp = Time.now();
      reference = transfer.reference;
      sender = ?caller;
      receiver = ?transfer.recipient;
    };
    recordTransaction(senderTransaction);

    // Record recipient transaction
    let recipientTransaction : Transaction = {
      id = nextTransactionId;
      owner = transfer.recipient;
      amount = transfer.amount;
      currency = transfer.currency;
      transactionType = #transfer_in;
      status = #completed;
      timestamp = Time.now();
      reference = transfer.reference;
      sender = ?caller;
      receiver = ?transfer.recipient;
    };
    recordTransaction(recipientTransaction);

    senderTxId;
  };

  public shared ({ caller }) func processAddMoney(request : FundingRequest) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add money");
    };
    if (request.amount == 0) {
      Runtime.trap("Invalid add money amount. Must be greater than 0");
    };

    let currentBalance = getBalance(caller, request.currency);
    setBalance(caller, request.currency, currentBalance + request.amount);

    let txId = nextTransactionId;
    let transaction : Transaction = {
      id = txId;
      owner = caller;
      amount = request.amount;
      currency = request.currency;
      transactionType = #funding;
      status = #completed;
      timestamp = Time.now();
      reference = request.reference;
      sender = ?caller;
      receiver = ?caller;
    };
    recordTransaction(transaction);

    txId;
  };

  public shared ({ caller }) func processCashOut(request : CashOutRequest) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can cash out");
    };
    if (request.amount == 0) {
      Runtime.trap("Invalid cash out amount. Must be greater than 0");
    };

    let currentBalance = getBalance(caller, request.currency);
    if (currentBalance < request.amount) {
      Runtime.trap("Insufficient funds for currency");
    };

    setBalance(caller, request.currency, currentBalance - request.amount);

    let txId = nextTransactionId;
    let transaction : Transaction = {
      id = txId;
      owner = caller;
      amount = request.amount;
      currency = request.currency;
      transactionType = #cash_out {
        provider = request.provider;
        destination = request.destination;
      };
      status = #pending;
      timestamp = Time.now();
      reference = request.reference;
      sender = ?caller;
      receiver = null;
    };
    recordTransaction(transaction);

    txId;
  };

  // --- Platform Connections ---

  public query ({ caller }) func getCallerConnections() : async [PlatformConnection] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view connections");
    };
    connections.values().filter(
      func(connection) {
        connection.owner == caller;
      }
    ).toArray();
  };

  public query ({ caller }) func getConnection(id : Nat) : async PlatformConnection {
    let connection = switch (connections.get(id)) {
      case (null) { Runtime.trap("Connection with id " # id.toText() # " does not exist") };
      case (?conn) { conn };
    };

    if (caller != connection.owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own connections");
    };

    connection;
  };

  public shared ({ caller }) func createConnection(name : Text, platformType : PlatformType, apiKey : Text, apiSecret : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create connections");
    };
    let id = nextConnectionId;
    nextConnectionId += 1;
    let connection : PlatformConnection = {
      id;
      owner = caller;
      name;
      platformType;
      apiKey;
      apiSecret;
    };
    connections.add(id, connection);
    id;
  };

  public shared ({ caller }) func updateConnection(id : Nat, name : Text, platformType : PlatformType, apiKey : Text, apiSecret : Text) : async () {
    let connection = switch (connections.get(id)) {
      case (null) { Runtime.trap("Connection with id " # id.toText() # " does not exist") };
      case (?conn) { conn };
    };

    if (caller != connection.owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only update your own connections");
    };

    connections.add(id, {
      connection with
      name;
      platformType;
      apiKey;
      apiSecret;
    });
  };

  public shared ({ caller }) func deleteConnection(id : Nat) : async () {
    let connection = switch (connections.get(id)) {
      case (null) { Runtime.trap("Connection with id " # id.toText() # " does not exist") };
      case (?conn) { conn };
    };
    if (caller != connection.owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete your own connection");
    };
    connections.remove(id);
  };
};
