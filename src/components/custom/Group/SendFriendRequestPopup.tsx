"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import axios from "@/lib/config/axios.config";
import { AxiosError } from "axios";
import { Loader2Icon, UserRoundPlusIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Socket } from "socket.io-client";

interface SendFriendRequestPopupProps {
    socket?: Socket | null;
}

const SendFriendRequestPopup: React.FC<SendFriendRequestPopupProps> = ({
    socket,
}) => {
    const usernameRef = useRef<HTMLInputElement | null>(null);
    const { toast } = useToast();
    const [isSendingRequest, setIsSendingRequest] = useState<boolean>(false);

    async function sendFriendRequest(e: React.FormEvent) {
        try {
            e.preventDefault();
            setIsSendingRequest(true);
            const usernameToSend = usernameRef.current?.value;
            if (usernameToSend && usernameToSend.length < 2) {
                toast({
                    title: "Error",
                    description: "Username should have atleast 2 characters",
                    duration: 2000,
                });
                return;
            }

            const response = await axios.post("/api/v1/friend-requests", {
                username: usernameToSend,
            });

            if (response.status !== 201) {
                toast({
                    title: "Error",
                    description:
                        response.data.error.message ?? "Something went wrong",
                });
            } else {
                socket?.emit("notification:client_friend-request", {
                    username: usernameToSend,
                    sentOn: response.data.data?.sentOn,
                });

                toast({
                    title: "Success",
                    description: "Friend request sent successfully",
                    className: "bg-green-700 text-slate-100",
                });
            }
        } catch (error) {
            console.log("ERROR: ", error);

            if (error instanceof AxiosError) {
                toast({
                    title: "Error",
                    description:
                        error.response?.data.error.message ??
                        "Something went wrong",
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Error",
                description: "Something went wrong",
            });
        } finally {
            setIsSendingRequest(false);
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <p className="rounded-[50%] bg-transparent p-2.5 pb-[0.635rem] hover:bg-slate-500 text-2xl cursor-pointer">
                    <UserRoundPlusIcon />
                </p>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="gap-1">
                    <DialogTitle className="lg:text-2xl text-xl font-semibold">
                        Send friend request
                    </DialogTitle>
                    <DialogDescription className="pl-px text-[.9rem]">
                        Enter the username of the user to send friend request
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={sendFriendRequest}
                    className="w-full h-full mt-2"
                >
                    <div className="flex flex-row flex-nowrap gap-3.5 items-center py-1.5 mb-4">
                        <label>Username</label>
                        <Input ref={usernameRef} />
                    </div>

                    <button
                        disabled={isSendingRequest}
                        className="text-[.95rem] px-4 py-[0.45rem] rounded-md bg-secondary hover:bg-secondary/80"
                    >
                        {isSendingRequest && (
                            <Loader2Icon className="animate-spin mr-2 h-[20px] mb-[2px] inline-block align-bottom" />
                        )}
                        Send
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SendFriendRequestPopup;
