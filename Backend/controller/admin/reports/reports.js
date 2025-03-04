import Report from "../../../model/admin/report/sales.js";

export const addSalesReport = async (req, res) => {
    const { adminId, tableId, Cname, Cphone, items, SubtotalAmmount, Discount, DiscountAmmount, totalAmmount, paymentType } = req.body;
    // if(totalAmount < 0) {
    //     return res.status(400).json({ message: "This Table Is " });
    // }
    try {

        const status = paymentType === "Due" ? "unpaid" : "paid";

        const newReportEntry = {
            tableId, // Fixed typo
            items,
            SubtotalAmmount,
            Discount,
            DiscountAmmount,
            totalAmmount,
            paymentType,
            status,
        };

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

    } catch (error) {
        console.error("Error adding sales report:", error); // Log for debugging
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};
