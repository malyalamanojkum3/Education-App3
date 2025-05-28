namespace my.App;

entity employee {
    key ID : Integer;
    firstName : String(10);
    lastName : String(10);
    jobTitle : String;
    companyId:Association to company;
    salary : Decimal(10,2)
}

entity company{
    key ID:Integer;
    companyName:String(20);
    address:String(32);
}