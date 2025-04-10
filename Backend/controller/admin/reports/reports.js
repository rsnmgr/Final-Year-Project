import Report from "../../../model/admin/report/sales.js";
import { io } from "../../../server.js";
import Order from "../../../model/customer/AddOrder.js";
export const addSalesReport = async (req, res) => {
    const { adminId, tableId, CustomerId, items, SubtotalAmmount, Discount, DiscountAmmount, totalAmmount, paymentType } = req.body;

    if (totalAmmount <= 0) {
        return res.status(400).json({ message: "Total amount must be greater than 0." });
    }

    try {
        const status = paymentType === "Due" ? "unpaid" : "paid";

        const newReportEntry = {
            tableId,
            CustomerId,
            items,
            SubtotalAmmount,
            Discount,
            DiscountAmmount,
            totalAmmount,
            paymentType,
            status,
        };

        let order = await Order.findOne({ AdminId: adminId, tableId: tableId });

        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        const orderHistory = order.OrderHistory || [];

        // Check if all orderHistory items have itemsStatus === "Finished"
        const allItemsFinished = orderHistory.every(item => item.itemsStatus === "Finished");

        if (!allItemsFinished) {
            return res.status(400).json({ message: "All items must have 'Finished' status before bill settlement." });
        }

        let report = await Report.findOne({ adminId });

        if (report) {
            report.sales.push(newReportEntry);
        } else {
            report = new Report({
                adminId,
                sales: [newReportEntry]
            });
        }

        await report.save();
        res.status(200).json({ message: "Report added successfully" });
        io.emit("reportAdded", report);

    } catch (error) {
        console.error("Error adding sales report:", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};



// Fetch all sales reports for the given adminId
export const getAllSalesReports = async (req,res)=>{
    const {adminId} = req.params;
    try {
        const report = await Report.findOne({adminId:adminId});
        if (!report) {
            return res.status(404).json({ message: "No sales report found for this admin." });
        }

        res.status(200).json(report);
    } catch (error) {
        console.error("Error fetching sales reports:", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
}


export const deleteSale = async (req, res) => {
    const { adminId, saleId } = req.params;

    try {
        const report = await Report.findOne({ adminId });

        if (!report) {
            return res.status(404).json({ message: "No sales report found for this admin." });
        }

        // Filter out the sale to be deleted
        const updatedSales = report.sales.filter(sale => sale._id.toString() !== saleId);

        // If no change in length, saleId was not found
        if (updatedSales.length === report.sales.length) {
            return res.status(404).json({ message: "Sale entry not found" });
        }

        // Update and save the report
        report.sales = updatedSales;
        await report.save();

        res.status(200).json({ message: "Sale deleted successfully" });
        io.emit("saleDeleted", { adminId, saleId });

    } catch (error) {
        console.error("Error deleting sale:", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};