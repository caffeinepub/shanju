import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Char "mo:core/Char";
import List "mo:core/List";
import Nat32 "mo:core/Nat32";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



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
    id : Nat;
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
  let phoneNumberToPrincipal = Map.empty<Text, Principal>();
  let payments = Map.empty<Nat, Payment>();
  let connections = Map.empty<Nat, PlatformConnection>();
  var nextPaymentId = 1;
  var nextConnectionId = 1;

  let walletBalances = Map.empty<Principal, Map.Map<Currency, Nat>>();
  let transactions = Map.empty<Nat, Transaction>();
  var nextTransactionId = 1;

  // Add Money/OTP support
  public type OTPData = {
    referenceId : Nat;
    owner : Principal;
    code : Nat;
    timestamp : Time.Time;
    verified : Bool;
    fundingRequest : ?FundingRequest;
  };

  let otps = Map.empty<Nat, OTPData>();
  var nextReferenceId = 1;

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

  func normalizePhoneNumber(phone : Text) : Text {
    let chars = List.empty<Char>();
    for (c in phone.chars()) {
      let code = c.toNat32();
      if (code >= 48 and code <= 57) {
        chars.add(c);
      };
    };
    let digits = chars.reverse();
    Text.fromIter(digits.values());
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

    let normalizedPhone = normalizePhoneNumber(account.phone);

    if (normalizedPhone.size() == 0) {
      Runtime.trap("Phone number cannot be empty");
    };

    switch (personalAccounts.get(caller)) {
      case (?existingAccount) {
        let oldNormalizedPhone = normalizePhoneNumber(existingAccount.phone);
        if (oldNormalizedPhone != normalizedPhone) {
          phoneNumberToPrincipal.remove(oldNormalizedPhone);
        };
      };
      case (null) {};
    };

    switch (phoneNumberToPrincipal.get(normalizedPhone)) {
      case (?existingPrincipal) {
        if (existingPrincipal != caller) {
          Runtime.trap("Phone number already in use by another account");
        };
      };
      case (null) {};
    };

    personalAccounts.add(caller, { account with phone = normalizedPhone });

    phoneNumberToPrincipal.add(normalizedPhone, caller);
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
      id;
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

  public shared ({ caller }) func createPaymentByPhone(
    phoneNumber : Text,
    amount : Nat,
    currency : Text,
    description : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create payments");
    };

    let normalizedPhone = normalizePhoneNumber(phoneNumber);

    let payee = switch (phoneNumberToPrincipal.get(normalizedPhone)) {
      case (?p) { p };
      case (null) { Runtime.trap("Payee with phone number " # normalizedPhone # " does not exist") };
    };

    let id = nextPaymentId;
    nextPaymentId += 1;
    let payment : Payment = {
      id;
      payer = caller;
      payee;
      amount;
      currency;
      description;
      status = #pending;
    };
    payments.add(id, payment);

    Runtime.trap("createPaymentByPhone is not yet implemented, payment id " # id.toText() # " was created, but payment by phone does not work yet");
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

  // --- Admin APIs ---

  public query ({ caller }) func getUserAccount(user : Principal) : async {
    profile : ?UserProfile;
    personalAccount : ?PersonalAccount;
    walletBalances : ?[WalletBalance];
    transactions : ?[Transaction];
  } {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access user data");
    };

    // Retrieve wallet balances as array
    let userWallet = switch (walletBalances.get(user)) {
      case (null) { ?[] };
      case (?balances) {
        ?balances.toArray().map(
          func((currency, amount)) {
            { currency; amount };
          }
        );
      };
    };

    let userData = {
      profile = userProfiles.get(user);
      personalAccount = personalAccounts.get(user);
      walletBalances = userWallet;
      transactions = ?transactions.values().filter(
        func(tx) {
          tx.owner == user;
        }
      ).toArray();
    };
    userData;
  };

  public query ({ caller }) func listAllUsers() : async [{
    principal : Principal;
    profile : ?UserProfile;
    personalAccount : ?PersonalAccount;
  }] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can list all users");
    };

    let profiles = userProfiles.entries().toArray();
    let accounts = personalAccounts.entries().toArray();

    let users = profiles.map(
      func((user, profile)) {
        let account = switch (personalAccounts.get(user)) {
          case (?account) { ?account };
          case (null) { null };
        };
        {
          principal = user;
          profile = ?profile;
          personalAccount = account;
        };
      }
    );

    users;
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
      #visa : {
        card_number : Text;
        card_holder : Text;
        expiry : Text;
        cvv : Text;
      };
      #mastercard : {
        card_number : Text;
        card_holder : Text;
        expiry : Text;
        cvv : Text;
      };
      #bank_account : {
        account_number : Text;
        account_holder : Text;
        bank_name : Text;
        routing_number : Text;
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

    setBalance(caller, transfer.currency, senderBalance - transfer.amount);

    let recipientBalance = getBalance(transfer.recipient, transfer.currency);
    setBalance(transfer.recipient, transfer.currency, recipientBalance + transfer.amount);

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

  public type InternalTransferRequestByPhone = {
    phoneNumber : Text;
    amount : Nat;
    currency : Currency;
    reference : ?Text;
  };

  public shared ({ caller }) func processInternalTransferByPhone(transfer : InternalTransferRequestByPhone) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can transfer");
    };
    if (transfer.amount == 0) {
      Runtime.trap("Invalid transfer amount. Must be greater than 0");
    };

    let normalizedPhone = normalizePhoneNumber(transfer.phoneNumber);
    let recipient = switch (phoneNumberToPrincipal.get(normalizedPhone)) {
      case (?recipient) { recipient };
      case (null) { Runtime.trap("Recipient with phone number " # normalizedPhone # " does not exist") };
    };

    if (recipient == caller) {
      Runtime.trap("Cannot transfer to yourself");
    };

    let senderBalance = getBalance(caller, transfer.currency);
    if (senderBalance < transfer.amount) {
      Runtime.trap("Insufficient funds for currency");
    };

    setBalance(caller, transfer.currency, senderBalance - transfer.amount);

    let recipientBalance = getBalance(recipient, transfer.currency);
    setBalance(recipient, transfer.currency, recipientBalance + transfer.amount);

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
      receiver = ?recipient;
    };
    recordTransaction(senderTransaction);

    let recipientTransaction : Transaction = {
      id = nextTransactionId;
      owner = recipient;
      amount = transfer.amount;
      currency = transfer.currency;
      transactionType = #transfer_in;
      status = #completed;
      timestamp = Time.now();
      reference = transfer.reference;
      sender = ?caller;
      receiver = ?recipient;
    };
    recordTransaction(recipientTransaction);

    senderTxId;
  };

  // Add Money/OTP Functions

  // 1. Start Add Money (trigger OTP challenge)
  public shared ({ caller }) func startAddMoney(request : FundingRequest) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add money");
    };
    if (request.amount == 0) {
      Runtime.trap("Invalid add money amount. Must be greater than 0");
    };

    // Validate required proof fields based on funding method
    switch (request.method) {
      case (#visa({ card_number; card_holder; expiry; cvv })) {
        if (card_number.size() == 0) {
          Runtime.trap("Card number is required for Visa funding");
        };
        if (card_holder.size() == 0) {
          Runtime.trap("Card holder name is required for Visa funding");
        };
        if (expiry.size() == 0) {
          Runtime.trap("Card expiry date is required for Visa funding");
        };
        if (cvv.size() == 0) {
          Runtime.trap("CVV is required for Visa funding");
        };
      };
      case (#mastercard({ card_number; card_holder; expiry; cvv })) {
        if (card_number.size() == 0) {
          Runtime.trap("Card number is required for Mastercard funding");
        };
        if (card_holder.size() == 0) {
          Runtime.trap("Card holder name is required for Mastercard funding");
        };
        if (expiry.size() == 0) {
          Runtime.trap("Card expiry date is required for Mastercard funding");
        };
        if (cvv.size() == 0) {
          Runtime.trap("CVV is required for Mastercard funding");
        };
      };
      case (#bank_account({ account_number; account_holder; bank_name; routing_number })) {
        if (account_number.size() == 0) {
          Runtime.trap("Bank account number is required for bank account funding");
        };
        if (account_holder.size() == 0) {
          Runtime.trap("Account holder name is required for bank account funding");
        };
        if (bank_name.size() == 0) {
          Runtime.trap("Bank name is required for bank account funding");
        };
        if (routing_number.size() == 0) {
          Runtime.trap("Routing number is required for bank account funding");
        };
      };
    };

    // Create OTP challenge entry (do NOT credit balance yet)
    let referenceId = nextReferenceId;
    nextReferenceId += 1;

    let otpData : OTPData = {
      referenceId;
      owner = caller;
      code = 123456 % 999999;
      timestamp = Time.now();
      verified = false;
      fundingRequest = ?request;
    };

    otps.add(referenceId, otpData);

    referenceId;
  };

  // 2. Verify Add Money via OTP
  public shared ({ caller }) func verifyAddMoney(referenceId : Nat, otp : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can verify add money");
    };

    // Lookup OTP record
    let otpData = switch (otps.get(referenceId)) {
      case (null) { Runtime.trap("Invalid transaction reference or expired OTP") };
      case (?otpData) { otpData };
    };

    // AUTHORIZATION: Verify caller owns this funding request
    if (caller != otpData.owner) {
      Runtime.trap("Unauthorized: Can only verify your own funding requests");
    };

    // Validate OTP (6 digits)
    if (otp != otpData.code) {
      Runtime.trap("Invalid OTP code");
    };

    let fundingRequest = switch (otpData.fundingRequest) {
      case (null) {
        Runtime.trap("Funding request missing - cannot process transaction");
      };
      case (?request) { request };
    };

    // Verify OTP record is not already used
    if (otpData.verified) {
      Runtime.trap("Add money attempt already completed - duplicate attempt");
    };

    // Perform final balance update and record completed transaction
    let txId = nextTransactionId;

    let transaction : Transaction = {
      id = txId;
      owner = caller;
      amount = fundingRequest.amount;
      currency = fundingRequest.currency;
      transactionType = #funding;
      status = #completed;
      timestamp = Time.now();
      reference = fundingRequest.reference;
      sender = ?caller;
      receiver = ?caller;
    };
    recordTransaction(transaction);

    let currentBalance = getBalance(caller, fundingRequest.currency);
    setBalance(caller, fundingRequest.currency, currentBalance + fundingRequest.amount);

    // Mark OTP as verified & clear transaction reference
    otps.add(referenceId, {
      otpData with
      verified = true;
      code = 0;
      fundingRequest = null;
    });

    txId;
  };

  // 3. Resend/Regenerate OTP
  public shared ({ caller }) func resendAddMoneyOtp(referenceId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can resend OTP");
    };

    // Lookup OTP record
    let otpData = switch (otps.get(referenceId)) {
      case (null) { Runtime.trap("Invalid transaction reference or expired OTP") };
      case (?otpData) { otpData };
    };

    // AUTHORIZATION: Verify caller owns this funding request
    if (caller != otpData.owner) {
      Runtime.trap("Unauthorized: Can only resend OTP for your own funding requests");
    };

    let _ = switch (otpData.fundingRequest) {
      case (null) {
        Runtime.trap("Funding request missing - cannot generate OTP");
      };
      case (?request) { request };
    };

    let code = 123456 % 999999;

    // Update record with new OTP
    otps.add(referenceId, {
      otpData with
      code;
      timestamp = Time.now();
      verified = false;
    });
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

