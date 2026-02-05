import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
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
    currency : Text; // ISO 4217 currency code (e.g., "USD", "EUR", "CHF")
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

  let userProfiles = Map.empty<Principal, UserProfile>();
  let payments = Map.empty<Nat, Payment>();
  var nextPaymentId = 1;

  let connections = Map.empty<Nat, PlatformConnection>();
  var nextConnectionId = 1;

  /// Get the caller's user profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  /// Get a user's profile
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  /// Save the caller's user profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  /// Create a new payment request with currency
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

  /// Get payment by id
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

  /// List all payments for a user
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

  /// Update the status of a payment
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

  /// List all payments
  public query ({ caller }) func listAllPayments() : async [Payment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list all payments");
    };
    payments.values().toArray().sort();
  };

  public query ({ caller }) func getCallerConnections() : async [PlatformConnection] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view connector store");
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
      Runtime.trap("Unauthorized: Only authenticated users can create connectors");
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
