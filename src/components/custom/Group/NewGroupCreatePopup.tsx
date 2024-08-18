"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useRef, useState } from "react";
import axios from "@/lib/config/axios.config";
import { Loader2Icon } from "lucide-react";
import { AxiosError } from "axios";

interface NewGroupCreatePopupProps {}

const NewGroupCreatePopup: React.FC<NewGroupCreatePopupProps> = function ({}) {
    const [friendsData, setFriendsData] = useState<
        { _id: string; username: string }[] | null
    >();

    const fetchFriendsData = async () => {
        try {
            const response = await axios.get("/api/v1/friends");

            if (response.status === 200) return response.data.data.friends;
            else return null;
        } catch (error) {
            return null;
        }
    };

    useEffect(() => {
        (async () => {
            const data = await fetchFriendsData();
            setFriendsData(data);
        })();
    }, []);

    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [formErrors, setFormErrors] = useState<string>("");

    const groupNameRef = useRef<HTMLInputElement>(null);
    const groupDescriptionRef = useRef<HTMLTextAreaElement>(null);

    const { toast } = useToast();

    const createGroup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!groupNameRef.current?.value.trim()) {
            setFormErrors("Group name is required");
            return;
        }

        try {
            setIsCreating(true);
            const response = await axios.post("/api/v1/groups", {
                name: groupNameRef.current?.value,
                description: groupDescriptionRef.current?.value,
                members: ["66ac3573d4b885d0f0bcd72a"], // TODO: Change here
            });

            if (response.status === 201) {
                toast({
                    title: "Success",
                    description: "Group created successfully",
                    className: "bg-green-700 text-slate-100",
                });
            } else
                toast({
                    title: response?.data.error.cause ?? "Error",
                    description:
                        response?.data.error.message ?? "Something went wrong",
                    variant: "destructive",
                });
        } catch (error) {
            if (error instanceof AxiosError) {
                toast({
                    title: error.response?.data.error.cause ?? "Error",
                    description:
                        error.response?.data.error.message ??
                        "Something went wrong",
                    variant: "destructive",
                });
            } else
                toast({
                    title: "Error",
                    description: "Something went wrong",
                    variant: "destructive",
                });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <p className="flex flex-col flex-nowrap items-center justify-center rounded-[50%] h-[2.15rem] w-[2.15rem] text-center mr-2 bg-transparent hover:bg-slate-500 cursor-pointer">
                        +
                    </p>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] lg:max-w-[600px]">
                    <DialogHeader className="gap-1">
                        <DialogTitle className="lg:text-2xl text-xl font-semibold">
                            Create new group
                        </DialogTitle>
                        <DialogDescription className="pl-px text-[.9rem]">
                            Click submit to create the group
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={createGroup} className="w-full h-full mt-2">
                        <div className="flex flex-row flex-nowrap gap-3.5 items-center py-1.5 mb-4">
                            <label>Name</label>
                            <Input ref={groupNameRef} />
                        </div>

                        <div className="flex flex-row flex-nowrap gap-5 py-1.5 mb-4">
                            <label className="pt-0.5">Description</label>
                            <textarea
                                className="text-[1.075rem] w-full resize-none min-h-[100px] rounded-md border border-input bg-background px-3 py-2 pt-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                ref={groupDescriptionRef}
                            />
                        </div>

                        <div className="w-full flex flex-row flex-nowrap gap-5 items-center">
                            <label className="pb-1">Members</label>

                            <select className="w-full bg-transparent border-[1.45px] border-[#1b263b] rounded-md pl-3.5 py-2 cursor-pointer">
                                {friendsData?.map((friend, index) => (
                                    <option
                                        className="cursor-pointer"
                                        key={index}
                                        value={friend._id}
                                    >
                                        {friend.username}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {formErrors && (
                            <p className="text-sm text-red-500 mt-2.5">
                                {formErrors}
                            </p>
                        )}

                        <Button
                            className="mt-5 mr-0.5"
                            type="submit"
                            variant={"secondary"}
                        >
                            {isCreating && (
                                <Loader2Icon className="animate-spin font-medium mr-1.5 h-5 mb-0.5" />
                            )}
                            Create
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default NewGroupCreatePopup;
