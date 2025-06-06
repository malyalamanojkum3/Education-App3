const cds = require('@sap/cds');

module.exports = cds.service.impl(function(){
  const { customer} = this.entities;
    function customIdGenerator(){
        const currentYear = new Date().getFullYear();
        const randomNumber = Math.floor(Math.random() * 10000);
        const Id = `${currentYear}-EducationLoan-${randomNumber}`;
        return Id;
    }

    this.on('uploadDocument', async (req) => {
      const { fileName, fileContent } = req.data;
      // Decode the base64 content
      const buffer = Buffer.from(fileContent, 'base64');
      // Simulate saving the file (e.g., to local disk, S3, or a database)
      // For now, just return a dummy URL
      const fileUrl = `/files/${fileName}`;
      // You can add logic here to actually store the file if needed
      return fileUrl;
    });
  
    this.on('submitLoanApplication', async req => {
        const data = req.data;
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
          document: data.documentUrl
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
      }),

      this.on('getPagedCustomers', async function (req) {
        const { page = 1, pageSize = 10 } = req.data;
        const { customer } = this.entities;
        const offset = (page - 1) * pageSize;
        // Use cds.tx(req).run with SELECT for paged results
        const results = await cds.tx(req).run(
          cds.ql.SELECT.from(customer).limit(pageSize, offset)
        );
        // Use cds.tx(req).run for count
        const totalResult = await cds.tx(req).run(
          cds.ql.SELECT.from(customer).columns('count(1) as count')
        );
        const totalCount = totalResult && totalResult[0] && totalResult[0].count ? totalResult[0].count : 0;
        return {
            results,
            totalCount
        };
      });
    })