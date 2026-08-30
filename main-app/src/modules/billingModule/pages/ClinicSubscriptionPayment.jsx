import { useLocation } from "react-router-dom";
import Payment from "../components/Payment";
import { createSubscriptionPayment } from "../api";

export default function ClinicSubscriptionPayment() {
    const { state } = useLocation();

    const handlePay = async () => {
        try {
            const data = await createSubscriptionPayment({
                email: state.email,
            });

            const paymentData = data.paymentData;

            const form = document.createElement("form");
            form.method = "POST";
            form.action = "https://test.payu.in/_payment";

            Object.entries(paymentData).forEach(([key, value]) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = value;
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Payment
            title="Complete Your Subscription"
            description="Activate your clinic account."
            planName="Clinic Subscription"
            billingCycle={state.subscriptionType}
            amount={state.subscriptionPrice}
            onPay={handlePay}
        />
    );
}