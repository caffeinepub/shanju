import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  // Old PersonalAccount type without password and NID
  type OldPersonalAccount = {
    fullName : Text;
    address : Text;
    email : Text;
    phone : Text;
    taxId : Text;
  };

  // Old actor type
  type OldActor = {
    personalAccounts : Map.Map<Principal, OldPersonalAccount>;
  };

  // New PersonalAccount type with password and NID fields
  type NewPersonalAccount = {
    fullName : Text;
    address : Text;
    email : Text;
    phone : Text;
    taxId : Text;
    password : Text;
    nid : Text;
  };

  // New actor type
  type NewActor = {
    personalAccounts : Map.Map<Principal, NewPersonalAccount>;
  };

  // Migration function called by the main actor via with-clause
  public func run(old : OldActor) : NewActor {
    let newAccounts = old.personalAccounts.map<Principal, OldPersonalAccount, NewPersonalAccount>(
      func(_principal, oldAccount) {
        { oldAccount with password = ""; nid = "" }; // New fields are set to empty Text
      }
    );
    { personalAccounts = newAccounts };
  };
};
