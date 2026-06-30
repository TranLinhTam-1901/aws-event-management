import React from "react";
import { useNavigate } from "react-router-dom";

import { EventList } from "../../components/events/EventList";
import { AppButton } from "../../components/common/AppButton";

export const EventManagementPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">
                    Event Management
                </h1>

                <AppButton
                    variant="primary"
                    onClick={() => navigate("/admin/events/create")}
                >
                    Create Event
                </AppButton>
            </div>

            <EventList variant="admin" />
        </>
    );
};