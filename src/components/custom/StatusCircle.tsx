import React from "react";

interface StatusCircleProps {
    status: "CONNECTED" | "DISCONNECTED" | "CONNECTING"; // connected or disconnected
    className?: string;
}

const StatusCircle = ({ status, className }: StatusCircleProps) => {
    const statusColors = {
        CONNECTED: "bg-green-500",
        DISCONNECTED: "bg-red-500",
        CONNECTING: "bg-yellow-500 animate-pulse",
    };

    return (
        <div
            style={{
                boxShadow: "0 0 5.5px .7px lightgray",
            }}
            className={`rounded-full ${statusColors[status]} ${className}`}
        ></div>
    );
};

export default StatusCircle;
