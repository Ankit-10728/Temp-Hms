import PlanForm from "./PlanForm";

export default function PlanModal({ open, plan, onClose, onSaved, onCreated, readOnly = false }) {
    if (!open) return null;

    return (
        <PlanForm
            plan={plan}
            onClose={onClose}
            onSaved={onSaved}
            onCreated={onCreated}
            readOnly={readOnly}
        />
    );
}
