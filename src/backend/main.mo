import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type EmploymentType = {
    #salaried;
    #selfEmployed;
  };

  type LoanTenure = {
    #threeMonths;
    #sixMonths;
    #twelveMonths;
  };

  type LoanStatus = {
    #pending;
    #approved;
    #rejected;
  };

  type ENACHDetails = {
    bankName : Text;
    accountNumber : Text;
    ifscCode : Text;
    accountHolder : Text;
  };

  type LoanApplication = {
    applicant : Principal;
    amount : Nat;
    tenure : LoanTenure;
    cibilScore : Nat;
    employmentType : EmploymentType;
    monthlyIncome : Nat;
    employmentDetails : Text;
    applicationTime : Time.Time;
    status : LoanStatus;
    enachDetails : ENACHDetails;
  };

  module LoanApplication {
    func compareLoanTenure(a : LoanTenure, b : LoanTenure) : Order.Order {
      switch (a, b) {
        case (#threeMonths, #threeMonths) { #equal };
        case (#threeMonths, _) { #less };
        case (#sixMonths, #threeMonths) { #greater };
        case (#sixMonths, #sixMonths) { #equal };
        case (#sixMonths, #twelveMonths) { #less };
        case (#twelveMonths, #twelveMonths) { #equal };
        case (#twelveMonths, _) { #greater };
      };
    };

    public func compare(a : LoanApplication, b : LoanApplication) : Order.Order {
      switch (Principal.compare(a.applicant, b.applicant)) {
        case (#equal) {
          compareLoanTenure(a.tenure, b.tenure);
        };
        case (order) { order };
      };
    };

    public func toPublic(app : LoanApplication) : LoanApplicationPublic {
      app;
    };
  };

  type NewApplication = {
    amount : Nat;
    cibilScore : Nat;
    employmentType : EmploymentType;
    monthlyIncome : Nat;
    employmentDetails : Text;
    tenure : LoanTenure;
    enachDetails : ENACHDetails;
  };

  public type LoanApplicationPublic = {
    applicant : Principal;
    amount : Nat;
    tenure : LoanTenure;
    cibilScore : Nat;
    employmentType : EmploymentType;
    monthlyIncome : Nat;
    employmentDetails : Text;
    applicationTime : Time.Time;
    status : LoanStatus;
    enachDetails : ENACHDetails;
  };

  let loans = Map.empty<Nat, LoanApplication>();
  var nextApplicationId = 1;

  func internalApplyForLoan(newApp : NewApplication, applicant : Principal) : (Nat, LoanApplication) {
    if (newApp.cibilScore < 650) {
      Runtime.trap("CIBIL score must be at least 650");
    };
    if (newApp.amount < 1000 or newApp.amount > 5000) {
      Runtime.trap("Requested amount must be between 1000 and 5000 INR");
    };
    if (newApp.monthlyIncome == 0 and newApp.employmentType == #salaried) {
      Runtime.trap("Monthly income must be a positive value for salaried applicants");
    };

    let app : LoanApplication = {
      newApp with
      applicant;
      applicationTime = Time.now();
      status = #pending;
    };

    let applicationId = nextApplicationId;
    loans.add(applicationId, app);
    nextApplicationId += 1;
    (applicationId, app);
  };

  func internalGetApplication(appId : Nat) : LoanApplication {
    switch (loans.get(appId)) {
      case (null) { Runtime.trap("Application not found") };
      case (?app) { app };
    };
  };

  public shared ({ caller }) func applyForLoan(newApp : NewApplication) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Only users can apply for a loan");
    };
    internalApplyForLoan(newApp, caller).0;
  };

  public query ({ caller }) func getApplication(applicationId : Nat) : async LoanApplicationPublic {
    let app = internalGetApplication(applicationId);
    if (app.applicant != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own application");
    };
    LoanApplication.toPublic(app);
  };

  public query ({ caller }) func getMyApplications() : async [LoanApplicationPublic] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Only users can view their applications");
    };
    loans.values().toArray().filter(func(la) { la.applicant == caller }).sort().map(LoanApplication.toPublic);
  };

  public query ({ caller }) func getAllApplications() : async [LoanApplicationPublic] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can view all applications");
    };
    loans.values().toArray().sort().map(LoanApplication.toPublic);
  };

  public query ({ caller }) func getPendingApplications() : async [LoanApplicationPublic] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can view pending applications");
    };
    loans.values().toArray().filter(func(la) { la.status == #pending }).sort().map(LoanApplication.toPublic);
  };

  public shared ({ caller }) func approveApplication(applicationId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can approve applications");
    };
    let app = internalGetApplication(applicationId);
    let updatedApp : LoanApplication = { app with status = #approved };
    loans.add(applicationId, updatedApp);
  };

  public shared ({ caller }) func rejectApplication(applicationId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admins can reject applications");
    };
    let app = internalGetApplication(applicationId);
    let updatedApp : LoanApplication = { app with status = #rejected };
    loans.add(applicationId, updatedApp);
  };

  func calculateInterestRate(tenure : LoanTenure) : Nat {
    switch (tenure) {
      case (#threeMonths) { 6 };
      case (#sixMonths) { 12 };
      case (#twelveMonths) { 24 };
    };
  };

  func toRupeePaise(rupees : Nat) : Nat {
    rupees * 100;
  };

  func fromRupeePaise(paise : Nat) : (Nat, Nat) {
    (paise / 100, paise % 100);
  };

  public query func calculateEMI(amount : Nat, tenure : LoanTenure) : async {
    principal : Nat;
    interest : Nat;
    totalPayable : Nat;
    tenureMonths : Nat;
    monthlyEMI : Nat;
  } {
    if (amount == 0) {
      Runtime.trap("Amount must be a positive value");
    };

    let tenureMonths = switch (tenure) {
      case (#threeMonths) { 3 };
      case (#sixMonths) { 6 };
      case (#twelveMonths) { 12 };
    };

    let interestRate = calculateInterestRate(tenure);
    let principalPaise = toRupeePaise(amount);
    let totalInterestPaise = principalPaise * interestRate / 100;
    let totalPayablePaise = principalPaise + totalInterestPaise;
    let monthlyEMIPaise = totalPayablePaise / tenureMonths;

    {
      principal = amount;
      interest = totalInterestPaise / 100;
      totalPayable = totalPayablePaise / 100;
      tenureMonths;
      monthlyEMI = monthlyEMIPaise / 100;
    };
  };

  public query func checkEligibility(cibilScore : Nat, amount : Nat) : async Bool {
    cibilScore >= 650 and amount >= 1000 and amount <= 5000;
  };

  public shared ({ caller }) func modifyApplication(applicationId : Nat, updatedApp : NewApplication) : async () {
    let app = internalGetApplication(applicationId);

    if (app.applicant != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only modify your own applications");
    };

    if (updatedApp.cibilScore < 650) {
      Runtime.trap("CIBIL score must be at least 650");
    };
    if (updatedApp.amount < 1000 or updatedApp.amount > 5000) {
      Runtime.trap("Requested amount must be between 1000 and 5000 INR");
    };
    if (updatedApp.monthlyIncome == 0 and updatedApp.employmentType == #salaried) {
      Runtime.trap("Monthly income must be a positive value for salaried applicants");
    };

    let modifiedApp : LoanApplication = {
      updatedApp with
      applicant = app.applicant;
      applicationTime = app.applicationTime;
      status = app.status;
    };

    loans.add(applicationId, modifiedApp);
  };

  public shared ({ caller }) func deleteApplication(applicationId : Nat) : async () {
    let app = internalGetApplication(applicationId);

    if (app.applicant != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete your own applications");
    };

    checkLoanStatus(app);
    loans.remove(applicationId);
  };

  func checkLoanStatus(app : LoanApplication) {
    switch (app.status) {
      case (#pending) { Runtime.trap("Cannot delete application with status: pending") };
      case (_) {};
    };
  };
};
