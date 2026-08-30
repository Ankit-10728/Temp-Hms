

import { useEffect, useState } from "react";
import {
    getCurrentSubscription,
    getAllPlans,
} from "../../api/subscriptionApi";
import { useNavigate } from "react-router-dom";
import CurrentSubscriptionCard from "./CurrentSubscriptionCard";
import SubscriptionStats from "./SubscriptionStats";
import PlanCarousel from "./PlanCarousel";
import TrialSubscriptionCard from "./TrialSubscriptionCard";

function PrePaidSubscription() {
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    const handleUpgrade = () => {
        navigate("/payment", {
            state: {
                clinicId: currentSubscription.clinicId,
                email: currentSubscription.email,
            },
            replace: true,
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [subscriptionRes, plansRes] = await Promise.all([
                getCurrentSubscription(),
                getAllPlans(),
            ]);

            setCurrentSubscription(subscriptionRes.data);
            setPlans(plansRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!currentSubscription) {
        return (
            <div className="space-y-8 p-6">
                <h1 className="text-3xl font-bold">Subscription & Billing</h1>
                <p className="text-gray-600">
                    No subscription found for this clinic yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">

            <h1 className="text-3xl font-bold">
                Subscription & Billing
            </h1>
            {currentSubscription.status === "TRIAL" ? (
                <TrialSubscriptionCard
                    subscription={currentSubscription}
                    onUpgrade={handleUpgrade}
                />
            ) : (
                <CurrentSubscriptionCard
                    subscription={currentSubscription}
                />
            )}


            <PlanCarousel
                status={currentSubscription?.status}
                plans={plans}
                currentPlanId={currentSubscription.plan?._id}
            />

        </div>
    );
}


export default PrePaidSubscription