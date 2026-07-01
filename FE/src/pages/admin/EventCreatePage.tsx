import React from "react";
import { EventForm } from "../../components/events/EventForm";

export const EventCreatePage: React.FC = () => {
    return (
        <>
            <h1 className="text-3xl font-bold mb-8">
                Tạo sự kiện
            </h1>

            <div className="max-w-2xl">
                <EventForm />
            </div>
        </>
    );
};