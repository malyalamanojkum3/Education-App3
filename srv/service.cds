using { loanApp.db as db } from '../db/schema';

service myService{
    entity customer as projection on db.loanDetails;
    entity user as projection on db.userDetails;
    action uploadDocument(
        fileName: String, 
        fileContent: String) returns String;
    

  action registerUser(
    email: String,
    password: String,
    username: String,
    mobileNumber: String
  )returns String;

  // Define the loginUser action
  action loginUser(
    email: String,
    password: String
  )returns {
     message: String;
  };
    action submitLoanApplication(
        applicantName : String,
        applicantAddress : String,
        applicantPHno : String,
        applicantEmail : String,
        applicantAadhar : String,
        applicantPAN : String,
        applicantSalary : String,
        loanAmount : String,
        loanRepaymentMonths : String,
        document : String
        ) returns { Id : String; };
    action approveLoan( Id : String ) returns { Id: String; loanStatus: String; };
    action rejectLoan( Id : String ) returns { Id: String; loanStatus: String; };
    function trackLoan( Id : String ) returns array of {};
    function getPagedCustomers(page: Integer, pageSize: Integer) returns {
        results: array of {};
        totalCount: Integer;
    };
}