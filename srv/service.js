const { tx } = require("@sap/cds");
module.exports = cds.service.impl(function(){
  const { customer} = this.entities;
    function customIdGenerator(){
        const currentYear = new Date().getFullYear();
        const randomNumber = Math.floor(Math.random() * 10000);
        const Id = `${currentYear}-EducationLoan-${randomNumber}`;
        return Id;
    }

   
    const fs = require('fs');
    const path = require('path');
    
    this.on('uploadDocument', async (req) => {
      const { fileName, fileContent } = req.data;
      const buffer = Buffer.from(fileContent, 'base64');
    
      // Define the path to save the file
      const dirPath = path.join(__dirname, 'files');
      const filePath = path.join(dirPath, fileName);
    
      // Ensure the directory exists
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    
      // Save the file to disk
      fs.writeFileSync(filePath, buffer);
    
      // Return the URL to access the file
      const fileUrl = `/files/${fileName}`;
      return fileUrl;
    });
    

    this.on('submitLoanApplication', async req => {
        const data = req.data;
        console.log("Document URL before submit:", this.documentUrl);
        const Id = customIdGenerator();
        // Insert into DB
        const result = await cds.tx(req).create(customer).entries({
          Id,
          applicantName: data.applicantName,
          applicantAddress: data.applicantAddress,
          applicantPHno: data.applicantPHno,
          applicantEmail: data.applicantEmail,
          applicantAadhar: data.applicantAadhar,
          applicantPAN: data.applicantPAN,
          applicantSalary: data.applicantSalary,
          loanAmount: data.loanAmount,
          loanRepaymentMonths: data.loanRepaymentMonths,
          loanStatus: "Pending",
          document: data.document
        });
    
        return { Id };
      });

      this.on("approveLoan", async(req) => {
        const { Id } = req.data;
        const result = await cds.tx(req).update(customer).with({ loanStatus: "Approved" }).where({ Id });

        if (result === 0) {
          return req.error(404, `Loan application with Id ${Id} not found.`);
        }

        return { Id, loanStatus: "Approved" };
      })

      this.on("rejectLoan", async(req) => {
        const { Id } = req.data;

        const result = await cds.tx(req).update(customer).with({ loanStatus: "Rejected" }).where({ Id });
        if (result === 0) {
          return req.error(404, `Loan application with Id ${Id} not found.`);
        }

        return { Id, loanStatus: "Rejected" };
      }),

      this.on("trackLoan", async(req) => {
        const { Id } = req.data;
        const result = cds.tx(req).read(customer).where({Id});
        if (result === 0) {
          return req.error(404, `Loan application with Id ${Id} not found.`);
        }
        return result;
      })
    })