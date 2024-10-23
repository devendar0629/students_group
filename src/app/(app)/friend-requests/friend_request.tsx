"use client";

import UserAvatar from "@/components/custom/UserAvatar";
import { useToast } from "@/components/ui/use-toast";
import axios from "@/lib/config/axios.config";
import { formatTimeAgo } from "@/utils/dateformatter";
import { AxiosError } from "axios";

interface FriendRequestProps {
    friendRequest: any;
    isSender: boolean;
}

const FriendRequest: React.FC<FriendRequestProps> = function ({
    friendRequest,
    isSender,
}) {
    const { toast } = useToast();

    const acceptFriendRequest = async () => {
        try {
            const response = await axios.post(
                "/api/v1/friend-requests/accept",
                {
                    friendRequestId: friendRequest._id,
                }
            );

            if (response.status !== 201) {
                toast({
                    title: response.data.error.cause ?? "Error",
                    description:
                        response.data.error.message ?? "Something went wrong",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Friend request accepted successfully",
                    className: "bg-green-700 text-slate-100",
                });
                setTimeout(() => window.location.reload(), 2000); // reload the page after 2 seconds
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast({
                    title: error.response?.data.error.cause ?? "Error",
                    description:
                        error.response?.data.error.message ??
                        "Something went wrong",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Something went wrong",
                    variant: "destructive",
                });
            }
        }
    };
    const rejectFriendRequest = async () => {
        try {
            const response = await axios.post(
                "/api/v1/friend-requests/reject",
                {
                    friendRequestId: friendRequest._id,
                }
            );

            if (response.status !== 200) {
                toast({
                    title: response.data.error.cause ?? "Error",
                    description:
                        response.data.error.message ?? "Something went wrong",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Friend request rejected successfully",
                });
                setTimeout(() => window.location.reload(), 2000); // reload the page after 2 seconds
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast({
                    title: error.response?.data.error.cause ?? "Error",
                    description:
                        error.response?.data.error.message ??
                        "Something went wrong",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Something went wrong",
                    variant: "destructive",
                });
            }
        }
    };

    return (
        <>
            <div className="flex flex-row flex-nowrap rounded-sm w-full py-2.5 px-5 justify-between items-center bg-sky-900">
                <UserAvatar
                    className="rounded-md"
                    width={35}
                    height={35}
                    avatarUrl={friendRequest.sender.avatar}
                />
                <p>~{friendRequest.sender.username}</p>
                <div className="flex gap-1.5 flex-row mr-6 flex-nowrap items-center justify-center">
                    {!isSender && (
                        <button
                            onClick={acceptFriendRequest}
                            className="rounded-sm p-1 hover:bg-slate-400 bg-transparent"
                        >
                            ✅
                        </button>
                    )}
                    <button
                        onClick={rejectFriendRequest}
                        className="rounded-sm p-1 hover:bg-slate-400 bg-transparent"
                    >
                        ❌
                    </button>
                </div>
                <p className="text-sm font-light text-right">
                    {formatTimeAgo(new Date(friendRequest.createdAt))}
                </p>
            </div>
        </>
    );
};

export default FriendRequest;
