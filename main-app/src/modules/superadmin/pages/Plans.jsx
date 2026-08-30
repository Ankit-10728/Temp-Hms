import { useState } from "react";
import PlansHeaderButton from "../components/forms/plansForm/PlansHeaderButton";
import PlanModal from "../components/forms/plansForm/PlanModal";
import ActivePlans from "../components/ActivePlans";

function Plans() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [editorState, setEditorState] = useState({
        open: false,
        plan: null,
    });
    const [viewerState, setViewerState] = useState({
        open: false,
        plan: null,
    });

    const openCreateModal = () => {
        setEditorState({ open: true, plan: null });
    };

    const openEditModal = (plan) => {
        setEditorState({ open: true, plan });
    };

    const closeModal = () => {
        setEditorState({ open: false, plan: null });
    };

    const openViewModal = (plan) => {
        setViewerState({ open: true, plan });
    };

    const closeViewModal = () => {
        setViewerState({ open: false, plan: null });
    };

    const handleSaved = () => {
        setRefreshKey((key) => key + 1);
        closeModal();
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <PlansHeaderButton onAdd={openCreateModal} />

            <PlanModal
                open={editorState.open}
                plan={editorState.plan}
                onClose={closeModal}
                onSaved={handleSaved}
            />

            <PlanModal
                open={viewerState.open}
                plan={viewerState.plan}
                onClose={closeViewModal}
                readOnly
            />

            <ActivePlans
                refreshKey={refreshKey}
                onViewPlan={openViewModal}
                onEditPlan={openEditModal}
                onChanged={() => setRefreshKey((key) => key + 1)}
            />
        </div>
    );
}

export default Plans;
