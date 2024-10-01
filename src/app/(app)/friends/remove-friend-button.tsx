"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import axios from "@/lib/config/axios.config";
import { AxiosError } from "axios";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";

interface RemoveFriendButtonProps {
    friendId: string;
}

const RemoveFriendButton: React.FC<RemoveFriendButtonProps> = function ({
    friendId,
}) {
    const { toast } = useToast();
    const [isRemoving, setIsRemoving] = useState(false);

    const removeFriend = async () => {
        try {
            setIsRemoving(true);
            const response = await axios.patch("/api/v1/friends/remove", {
                userId: friendId,
            });

            if (response.status !== 200) {
                toast({
                    title: response.data.error.cause ?? "Error",
                    description:
                        response.data.error.message ?? "Something went wrong",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Success",
                    description: "Friend removed from friend list successfully",
                });

                setTimeout(() => window.location.reload(), 2000);
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
        } finally {
            setIsRemoving(false);
        }
    };

    return (
        <>
            <form className="w-fit h-fit">
                <Button
                    onClick={removeFriend}
                    className="px-2.5 py-1 ml-16"
                    variant={"destructive"}
                >
                    {isRemoving && (
                        <Loader2Icon className="h-5 mr-1 animate-spin" />
                    )}
                    ❌
                </Button>
            </form>
        </>
    );
};

export default RemoveFriendButton;
