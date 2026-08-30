import React from "react";
import { useLocation } from "react-router-dom";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import {
    ShieldCheck,
    ReceiptText,
    CalendarDays,
    Hash,
    CreditCard,
    Mail,
    Phone,
    BadgeCheck,
    Headphones,
} from "lucide-react";

const Receipt = ({
    receiptData,
    companyName,
    companyTagline,
    thankYouMessage,
    receiptTitle,
    receiptSubtitle,
    supportEmail,
    supportPhone,
    planDescription,
    onDownload,
    trustBadges,
}) => {

    const downloadReceipt = async () => {
        try {
            const receipt = document.getElementById("receipt-content");

            if (!receipt) {
                console.error("Receipt content not found");
                return;
            }

            const dataUrl = await toPng(receipt, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: "#ffffff",
            });

            const pdf = new jsPDF("p", "mm", "a4");

            const imgProps = pdf.getImageProperties(dataUrl);

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight =
                (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(
                dataUrl,
                "PNG",
                0,
                0,
                pdfWidth,
                pdfHeight
            );

            pdf.save(
                `receipt-${receiptData?.txnid || Date.now()}.pdf`
            );

        } catch (error) {
            console.error("PDF Download Error:", error);
        }
    };

    if (!receiptData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="bg-white p-10 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-red-500">
                        Receipt Data Not Found
                    </h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 py-10 px-4">
            <div className="max-w-6xl mx-auto mb-6 flex justify-end">
                <button
                    onClick={downloadReceipt}
                    className="bg-slate-900 text-white px-5 py-3 rounded-xl font-medium shadow-md"
                >
                    Download Receipt
                </button>
            </div>


            <div
                id="receipt-content"
                className="max-w-6xl mx-auto bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-200"
            >

                {/* HEADER */}
                <div className="flex justify-between items-center px-10 py-8">

                    <div>
                        <h1 className="text-5xl font-bold text-green-950">
                            {companyName}
                        </h1>

                        <p className="tracking-[6px] text-xs text-slate-500 mt-2">
                            {companyTagline}
                        </p>
                    </div>

                    <div className="flex gap-4">



                        <div className="bg-green-950 text-white px-6 py-4 rounded-2xl flex items-center gap-3 shadow-lg">
                            <ShieldCheck size={22} />
                            <span className="font-medium">
                                {thankYouMessage}
                            </span>
                        </div>

                    </div>

                </div>

                {/* HERO */}
                <div className="relative py-14 text-center">

                    <div className="absolute inset-0 opacity-5">
                        <div className="w-96 h-96 rounded-full bg-green-900 mx-auto blur-3xl"></div>
                    </div>

                    <div className="relative">

                        <div className="w-32 h-32 mx-auto rounded-full bg-green-950 flex items-center justify-center shadow-xl border-8 border-green-100">
                            <ReceiptText
                                size={55}
                                className="text-white"
                            />
                        </div>

                        <h2 className="text-6xl font-serif font-bold text-green-950 mt-8">
                            {receiptTitle}
                        </h2>

                        <p className="text-slate-500 mt-3 text-lg">
                            {receiptSubtitle}
                        </p>

                    </div>

                </div>

                {/* INFO STRIP */}
                <div className="mx-10 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">

                    <div className="grid md:grid-cols-3">

                        <div className="p-6 flex gap-4 items-start">
                            <CalendarDays size={28} className="text-green-950" />

                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">
                                    Payment Date
                                </p>

                                <h3 className="font-semibold text-lg mt-1">
                                    {receiptData.addedon}
                                </h3>
                            </div>
                        </div>

                        <div className="p-6 border-x flex gap-4 items-start">
                            <Hash size={28} className="text-green-950" />

                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">
                                    Transaction ID
                                </p>

                                <h3 className="font-semibold text-lg mt-1 break-all">
                                    {receiptData.txnid}
                                </h3>
                            </div>
                        </div>

                        <div className="p-6 flex gap-4 items-start">
                            <CreditCard size={28} className="text-green-950" />

                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">
                                    Payment ID
                                </p>

                                <h3 className="font-semibold text-lg mt-1 break-all">
                                    {receiptData.mihpayid}
                                </h3>
                            </div>
                        </div>

                    </div>

                </div>

                {/* BILLING */}
                <div className="px-10 py-10 border-t mt-8">

                    <div className="grid md:grid-cols-4 gap-8">

                        <div className="md:col-span-3">

                            <h3 className="text-2xl font-bold text-green-950 mb-5">
                                Billed To
                            </h3>

                            <p className="font-bold text-xl">
                                {receiptData.firstname}
                            </p>

                            <p className="text-slate-600 mt-2">
                                HMS Clinic Subscription
                            </p>

                            <div className="mt-5 space-y-2">

                                <div className="flex items-center gap-3">
                                    <Mail size={18} />
                                    <span>{receiptData.email}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Hash size={18} />
                                    <span>
                                        Ref: {receiptData.bank_ref_num}
                                    </span>
                                </div>

                            </div>

                        </div>

                        <div>
                            <div className="bg-slate-50 rounded-2xl p-5 border text-center">

                                <QRCode
                                    value={receiptData.txnid || "HMS"}
                                    size={140}
                                    className="mx-auto"
                                />

                                <p className="mt-4 text-sm text-slate-500">
                                    Scan to verify receipt
                                </p>

                            </div>
                        </div>

                    </div>

                </div>

                {/* TABLE */}
                <div className="px-10">

                    <h3 className="text-2xl font-bold text-green-950 mb-5">
                        Subscription Details
                    </h3>

                    <div className="border rounded-2xl overflow-hidden">

                        <table className="w-full">

                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left p-5">PLAN</th>
                                    <th className="text-left p-5">PAYMENT MODE</th>
                                    <th className="text-left p-5">STATUS</th>
                                    <th className="text-right p-5">AMOUNT</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr className="border-t">

                                    <td className="p-5">
                                        <div className="font-semibold">
                                            {receiptData.productinfo}
                                        </div>

                                        <div className="text-slate-500 text-sm mt-1">
                                            HMS Premium Subscription
                                        </div>
                                    </td>

                                    <td className="p-5">
                                        {receiptData.mode}
                                    </td>

                                    <td className="p-5">
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                                            {receiptData.status}
                                        </span>
                                    </td>

                                    <td className="p-5 text-right font-bold text-lg">
                                        ₹{receiptData.amount}
                                    </td>

                                </tr>
                            </tbody>

                        </table>

                    </div>

                </div>

                {/* TOTAL */}
                <div className="flex justify-end px-10 py-10">

                    <div className="w-full md:w-[420px]">

                        <div className="space-y-4">

                            <div className="flex justify-between text-lg">
                                <span>Subtotal</span>
                                <span>₹{receiptData.amount}</span>
                            </div>

                            <div className="flex justify-between text-lg">
                                <span>Taxes</span>
                                <span>₹0</span>
                            </div>

                            <div className="border-t pt-5 flex justify-between items-center">

                                <span className="text-3xl font-bold text-green-950">
                                    Total Paid
                                </span>

                                <span className="text-4xl font-bold text-green-950">
                                    ₹{receiptData.amount}
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

                {/* TRUST BADGES */}
                <div className="px-10 pb-10">

                    <div className="border rounded-2xl">

                        <div className="grid md:grid-cols-3">

                            <div className="p-6 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full border flex items-center justify-center">
                                    <BadgeCheck />
                                </div>

                                <div>
                                    <h4 className="font-bold">Verified Subscription</h4>
                                    <p className="text-slate-500 text-sm">
                                        Successfully activated
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 border-x flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full border flex items-center justify-center">
                                    <ShieldCheck />
                                </div>

                                <div>
                                    <h4 className="font-bold">Secure Payment</h4>
                                    <p className="text-slate-500 text-sm">
                                        Encrypted transaction
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full border flex items-center justify-center">
                                    <Headphones />
                                </div>

                                <div>
                                    <h4 className="font-bold">Support 24/7</h4>
                                    <p className="text-slate-500 text-sm">
                                        Always here to help
                                    </p>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>

                {/* CONTACT */}
                <div className="px-10 pb-8">

                    <div className="flex justify-center gap-12 text-slate-600">

                        <div className="flex items-center gap-2">
                            <Mail size={18} />
                            support@hms.com
                        </div>

                        <div className="flex items-center gap-2">
                            <Phone size={18} />
                            +91 1800 123 4567
                        </div>

                    </div>

                </div>

                {/* FOOTER */}
                <div className="bg-green-950 text-white text-center py-6">

                    <p className="text-lg">
                        HMS • Pet Healthcare Management System
                    </p>

                    <p className="text-sm text-green-100 mt-2">
                        © 2026 HMS. All rights reserved.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default Receipt;