sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/odata/v2/ODataModel",
    
    
], function (Controller, MessageToast, Filter,FilterOperator,ODataModel) {
    "use strict";
    

    return Controller.extend("project1.controller.AdminAppliedLoans", {
        
       
        onViewDetails: function (oEvent) {
            sap.ui.core.BusyIndicator.show(0);
            var oItem = oEvent.getSource().getBindingContext("mainModel");
            var oDialog = this.byId("customerDetailsDialog");
            oDialog.setBindingContext(oItem,"mainModel");
            oDialog.open(sap.ui.core.BusyIndicator.hide());
        },

        onCloseDialog: function () {
            this.byId("customerDetailsDialog").close();
        },

        onApproveLoan: function () {
            sap.ui.core.BusyIndicator.show(0);
        
            var oDialog = this.byId("customerDetailsDialog");
            var oContext = oDialog.getBindingContext("mainModel");
            var oModel = this.getView().getModel("mainModel");
            var oData = oContext.getObject();
        
            oModel.callFunction("/approveLoan", {
                method: "POST", 
                urlParameters: { Id : oData.Id},
                success: function () {
                    sap.ui.core.BusyIndicator.hide(); 
                    oModel.refresh();
                    MessageToast.show("Loan Approved");
                    oDialog.close();
                },
                error: function () {
                    sap.ui.core.BusyIndicator.hide(); 
                    MessageToast.show("Error Approving Loan");
                },
            });
        },
             

        onRejectLoan: function () {
            sap.ui.core.BusyIndicator.show(0);
        
            var oDialog = this.byId("customerDetailsDialog");
            var oContext = oDialog.getBindingContext("mainModel");
            var oModel = this.getView().getModel("mainModel");
            var oData = oContext.getObject();
        
            oModel.callFunction("/rejectLoan", {
                method: "POST", 
                urlParameters: { Id : oData.Id},
                success: function () {
                    sap.ui.core.BusyIndicator.hide(); 
                    oModel.refresh();
                    MessageToast.show("Loan Rejected");
                    oDialog.close();
                },
                error: function () {
                    sap.ui.core.BusyIndicator.hide(); 
                    MessageToast.show("Error Rejecting Loan");
                },
            });
        },
        onLogout: function () {

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("main");
            MessageToast.show("Logged out!");


        },
        onHome: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("dashboard");
            MessageToast.show("Returned Home");

        },
       
        onSearch: function (oEvent) 
        {
          //var sQurey = oEvent.getParameter("query");
          var sQurey = oEvent.getSource().getValue();
          var filterConditions = [
            new Filter("applicantName", FilterOperator.Contains, sQurey),
            new Filter("applicantEmail", FilterOperator.Contains, sQurey),
            new Filter("applicantPHno", FilterOperator.Contains, sQurey),
            new Filter("applicantAadhar", FilterOperator.Contains, sQurey),
            //new Filter("Id", FilterOperator.Contains, sQurey)

        ];
        var combinedFilters=new Filter({
            filters: filterConditions,
            and: false
        })
          var oTable = this.byId("loanList");
          var oBinding = oTable.getBinding("items");
          oBinding.filter(combinedFilters);
        },
      
        onReset: function(){
        var oTable = this.byId("loanList");
          var oBinding = oTable.getBinding("items");
          oBinding.filter([]);
          oBinding.sort([]);
          this.getView().byId("querySearch").setValue("");
          this.getView().byId("statusComboBox").setValue("All");
          this.getView().byId("GroupBy").setValue(""); 
        },      
        
onSort: function () {
         var oTable = this.byId("loanList");
         var oBinding = oTable.getBinding("items");    
     this._bSortAscending = !this._bSortAscending;
         var oSorter = new sap.ui.model.Sorter("applicantName", !this._bSortAscending);
         oBinding.sort(oSorter);
    },    
    onGroup: function () {
        var oTable = this.byId("loanList");
        var oBinding = oTable.getBinding("items");
        // Group by loanStatus with a custom group header
        var oSorter = new sap.ui.model.Sorter("loanStatus", false, function (oContext) {
            var status = oContext.getProperty("loanStatus");
            return {
                key: status,
                text: "LOAN STATUS : " + status
            };
        });
    
        oBinding.sort(oSorter);
    },  
    onDefaultActionAccept: function () {
        sap.m.MessageToast.show("Default export action triggered.");
        // You can call your default export logic here, e.g., export to PDF
    },
    onBeforeMenuOpen: function (oEvent) {
        console.log("Menu is about to open.");
        // Optional: Modify menu items dynamically here
    },
    onExportAsPDF: async function () {
        try {
            const { jsPDF } = window.jspdf;
            const oModel = this.getView().getModel("mainModel");
    
            // Bind to the entire entity set
            const oBinding = oModel.bindList("/customer");
            const oContexts = await oBinding.requestContexts();
    
            if (!oContexts.length) {
                sap.m.MessageToast.show("No customer data found.");
                return;
            }
    
            const doc = new jsPDF();
            doc.setFontSize(14);
            doc.text("Customer Loan Details", 20, 20);
    
            let y = 30;
            let index = 1;
    
            for (const oContext of oContexts) {
                const oData = await oContext.requestObject();
    
                doc.setFontSize(12);
                doc.text(`CUSTOMER ${index++}`, 20, y);
                y += 10;
    
                doc.setFontSize(10);
                doc.text("ID: " + oData.Id, 20, y);
                doc.text("Name: " + oData.applicantName, 20, y += 10);
                doc.text("Email: " + oData.applicantEmail, 20, y += 10);
                doc.text("Mobile: " + oData.applicantPHno, 20, y += 10);
                doc.text("Aadhar No.: " + oData.applicantAadhar, 20, y += 10);
                doc.text("PAN No.: " + oData.applicantPAN, 20, y += 10);
                doc.text("Salary: " + oData.applicantSalary, 20, y += 10);
                doc.text("Tenure: " + oData.loanRepaymentMonths + " Months", 20, y += 10);
                doc.text("Principal: " + oData.loanAmount, 20, y += 10);
                doc.text("Loan Status: " + oData.loanStatus, 20, y += 10);
                doc.text("Address: " + oData.applicantAddress, 20, y += 10);
    
                y += 20;
    
                // Add new page if content exceeds page height
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
            }
    
            doc.save("AllCustomerLoanDetails.pdf");
        } catch (err) {
            console.error("Error fetching customer data:", err);
            sap.m.MessageToast.show("Failed to export customer data.");
        }
    }    
,              
    
onExportToExcel: async function () {
    try {
        const oModel = this.getView().getModel("mainModel");

        // Bind to the entire customer list
        const oBinding = oModel.bindList("/customer");
        const oContexts = await oBinding.requestContexts();

        if (!oContexts.length) {
            sap.m.MessageToast.show("No customer data found.");
            return;
        }

        // Prepare header
        const worksheetData = [[
            "ID", "Name", "Email", "Mobile", "Aadhar No.", "PAN No.",
            "Salary", "Tenure", "Principal", "Loan Status", "Address"
        ]];

        // Add each customer's data
        for (const oContext of oContexts) {
            const oData = await oContext.requestObject();
            worksheetData.push([
                oData.Id,
                oData.applicantName,
                oData.applicantEmail,
                oData.applicantPHno,
                oData.applicantAadhar,
                oData.applicantPAN,
                oData.applicantSalary,
                oData.loanRepaymentMonths,
                oData.loanAmount,
                oData.loanStatus,
                oData.applicantAddress
            ]);
        }

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Loan Details");

        XLSX.writeFile(workbook, "CustomerLoanDetails.xlsx");
    } catch (err) {
        console.error("Error exporting Excel:", err);
        sap.m.MessageToast.show("Failed to export Excel file.");
    }
},
    onMenuAction: function (oEvent) {
        var selectedItem = oEvent.getParameter("item");
        if (!selectedItem) return;
    
        var selectedText = selectedItem.getText();
    
        switch (selectedText) {
            case "Export as PDF":
                this.onExportAsPDF();
                break;
            case "Export to Excel":
                this.onExportToExcel();
                break;
            default:
                sap.m.MessageToast.show("Unknown export option selected.");
        }
    },        
        onStatusChange: function () {
            var sSelectedKey = this.byId("statusComboBox").getSelectedKey();
            var oTable = this.byId("loanList");
            var oBinding = oTable.getBinding("items");
        
            var aFilters = [];
            if (sSelectedKey && sSelectedKey !== "All") {
                aFilters.push(new Filter("loanStatus", FilterOperator.EQ, sSelectedKey));
            }
        
            oBinding.filter(aFilters);
        
            // Update column visibility and no data text
            var oStatusColumn = this.byId("statusColumn");
            if (oStatusColumn) {
                oStatusColumn.setVisible(sSelectedKey === "All");
            }
        
            oTable.setNoDataText(sSelectedKey === "Pending" ? "Empty Right Now" : "No Data Available");
        },                
                   
isPending: function (status) {
         return status === "Pending";
    }   
    
// onDocumentPress: function (oEvent) {
//         const oItem = oEvent.getSource();
//         const sContent = oItem.getBindingContext("mainModel").getProperty("content");
//         if (sContent) {
//             const win = window.open();
//             win.document.write('<iframe src="' + sContent + '" frameborder="0" style="width:100%;height:100%;"></iframe>');
//         } else {
//             MessageToast.show("No document content available.");
//         }
//     }

                        
    });
})