const { tx } = require("@sap/cds");
const { v4: uuidv4 } = require('uuid');
module.exports = cds.service.impl(function(){
  const { customer} = this.entities;
    function customIdGenerator(){
        const currentYear = new Date().getFullYear();
        const randomNumber = Math.floor(Math.random() * 10000);
        const Id = `${currentYear}-EducationLoan-${randomNumber}`;
        return Id;
    }

    function Bulkvalidation(data){
      const validRecords = data.filter((record, index) => {
        if (!record.applicantName || !record.Id) {
            console.warn(`Skipping row ${index + 1}: Missing required fields`);
            return false;
        }
        return true;
    });
    return validRecords;
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
      }),


      this.on("bulkUpload", async (req) => {
        
      const {jsonData} = req.data;
        //console.log("jsonData",jsonData);
      
        try {
          const data = JSON.parse(jsonData);
          //console.log("data",data);
            if (!data || !Array.isArray(data) || data.length === 0) {
                return req.error(400, 'No data provided or data is not an array');
            }
    
            const tx = cds.transaction(req);
            const validRecords = Bulkvalidation(data);
            if (validRecords.length === 0) {
                return req.error(400, 'No valid records found');
            }

            // Batch insert
            await tx.run(INSERT.into(customer).entries(validRecords));
            
            return {
                message: 'Records upload successful',
                totalRecords: data.length,
                insertedRecords: validRecords.length,
                skippedRecords: data.length - validRecords.length
            };
            
        } catch (error) {
            console.error('Bulk upload error:', error);
            return req.error(500, `Bulk upload failed: ${error.message}`);
        }
    });
          
    })