"use client";

import { ActiveTab } from "./GroupBody";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "@/lib/config/axios.config";
import { useToast } from "@/components/ui/use-toast";
import { AxiosError } from "axios";
import { Loader2Icon, PlusIcon } from "lucide-react";
import React, { useRef, useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Socket } from "socket.io-client";
import { useRouter } from "next/navigation";

interface GroupSettingsProps {
    onBackButtonClick: (value: ActiveTab) => void;
    groupDetails: any;
    groupId: string;
    currUserId: string;
    onGroupDetailsChange: (name: string, description: string) => void;
    socket?: Socket | null;
}
interface LeaveGroupButtonProps {
    groupId: string;
    socket?: Socket | null;
}
interface AddUserButtonProps {
    groupId: string;
    socket?: Socket | null;
}

const LeaveGroupButton: React.FC<LeaveGroupButtonProps> = ({ groupId }) => {
    const [isLeaving, setIsLeaving] = useState(false);
    const { toast } = useToast();

    const router = useRouter();

    const leaveGroup: React.FormEventHandler = async (e) => {
        e.preventDefault();
        setIsLeaving(true);

        try {
            const response = await axios.delete(
                `/api/v1/groups/${groupId}/leave`
            );

            if (response.status === 200) {
                toast({
                    title: "Success",
                    description: "Removed from group successfully",
                    className: "bg-green-700 text-slate-100",
                });

                setTimeout(() => {
                    router.refresh();
                }, 1000);
            } else {
                toast({
                    title: "Error",
                    description:
                        response.data.error?.message ??
                        "Something went wrong while leaving the group",
                    variant: "destructive",
                });
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast({
                    title: "Error",
                    description:
                        error.response?.data.error.message ??
                        "Something went wrong while leaving the group",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Something went wrong while leaving the group",
                    variant: "destructive",
                });
            }
        } finally {
            setIsLeaving(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    size={"lg"}
                    className="w-fit flex flex-row items-center gap-2.5 pl-5 pr-4"
                    variant="destructive"
                >
                    Leave group{" "}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#e8eaed"
                    >
                        <path d="M200-120q-33 0-56.5-23.5T120-200v-160h80v160h560v-560H200v160h-80v-160q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm220-160-56-58 102-102H120v-80h346L364-622l56-58 200 200-200 200Z" />
                    </svg>
                </Button>
            </DialogTrigger>

            <DialogContent className="w-fit px-8">
                <DialogHeader className="flex flex-col flex-nowrap gap-1">
                    <DialogTitle className="text-xl">Leave group</DialogTitle>
                    <DialogDescription className="mt-10">
                        Are you sure you want to leave this group ?
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2"></div>
                <DialogFooter className="sm:justify-start sm:gap-3 lg:gap-4">
                    <DialogClose asChild>
                        <div>
                            <Button
                                onClick={leaveGroup}
                                variant={"destructive"}
                                className="px-5 flex flex-row flex-nowrap gap-2 items-center disabled:cursor-not-allowed"
                                disabled={isLeaving}
                            >
                                {isLeaving && (
                                    <Loader2Icon className="size-[1.1rem] animate-spin" />
                                )}
                                Yes
                            </Button>
                        </div>
                    </DialogClose>

                    <DialogClose asChild>
                        <Button
                            disabled={isLeaving}
                            className="px-5 disabled:cursor-not-allowed"
                            type="button"
                            variant="secondary"
                        >
                            No
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const AddUserButton: React.FC<AddUserButtonProps> = ({ groupId }) => {
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const usernameRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const addUser: React.FormEventHandler = async (e) => {
        e.preventDefault();
        if (!usernameRef.current?.value) return;

        setIsAdding(true);

        try {
            const response = await axios.post(
                `/api/v1/groups/${groupId}/add-user`,
                {
                    username: usernameRef.current.value,
                }
            );

            if (response.status !== 200) {
                toast({
                    title: "Error",
                    description:
                        response.data?.error.message ??
                        "Something went wrong while adding the user to group",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Success",
                    description: "User added to group successfully",
                    className: "bg-green-700 text-slate-100",
                });
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast({
                    title: "Error",
                    description:
                        error.response?.data?.error.message ??
                        "Something went wrong while adding the user to group",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description:
                        "Something went wrong while adding the user to group",
                    variant: "destructive",
                });
            }
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger className="w-fit focus-within:outline-none">
                <Button
                    size={"lg"}
                    variant={"outline"}
                    className="flex flex-row flex-nowrap items-center gap-2 pl-4 pr-5"
                >
                    <PlusIcon className="size-[1.15rem] mb-0.5" />
                    <p className="text-sm">Add user</p>
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-sm gap-2">
                <DialogHeader className="text-2xl font-semibold">
                    Add user
                </DialogHeader>

                <DialogDescription>
                    Enter the username of the user to add to group
                </DialogDescription>

                <DialogFooter className="sm:justify-start mt-5">
                    <form
                        onSubmit={addUser}
                        className="flex flex-row flex-nowrap gap-3 items-center w-[95%]"
                    >
                        <Input ref={usernameRef} className="w-full h-fit" />

                        <Button
                            disabled={isAdding}
                            className="h-fit flex flex-row flex-nowrap items-center gap-2 disabled:cursor-not-allowed"
                        >
                            {isAdding && (
                                <Loader2Icon className="size-[1.1rem] animate-spin mb-0.5" />
                            )}
                            Add
                        </Button>
                    </form>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const GroupSettings: React.FC<GroupSettingsProps> = function ({
    onBackButtonClick,
    groupDetails,
    groupId,
    currUserId,
    socket,
    onGroupDetailsChange,
}) {
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [currGroupDetails, setCurrGroupDetails] = useState<{
        name: string;
        description: string;
    }>({
        name: groupDetails.name,
        description: groupDetails.description,
    });

    const groupNameRef = useRef<HTMLInputElement>(null);
    const groupDescriptionRef = useRef<HTMLTextAreaElement>(null);

    const { toast } = useToast();

    const formSubmitHandler: React.FormEventHandler = async (e) => {
        e.preventDefault();

        // The data should contain atleast one changed field
        if (
            currGroupDetails.name === groupNameRef.current?.value &&
            currGroupDetails.description === groupDescriptionRef.current?.value
        ) {
            return;
        }

        setIsUpdating(true);

        try {
            const response = await axios.patch(`/api/v1/groups/${groupId}`, {
                name: groupNameRef.current?.value,
                description: groupDescriptionRef.current?.value,
            });

            if (response.status !== 200) {
                toast({
                    title: "Error",
                    description:
                        response.data?.error.message ??
                        "Something went wrong while updating group details",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Success",
                    description: "Group details updated successfully",
                    className: "bg-green-700 text-slate-100",
                });

                if (groupNameRef.current && groupDescriptionRef.current) {
                    setCurrGroupDetails({
                        name: groupNameRef.current.value,
                        description: groupDescriptionRef.current.value,
                    });

                    onGroupDetailsChange(
                        groupNameRef.current.value,
                        groupDescriptionRef.current.value
                    );
                }
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast({
                    title: "Error",
                    description:
                        error.response?.data?.error.message ??
                        "Something went wrong while updating group details",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description:
                        "Something went wrong while updating group details",
                    variant: "destructive",
                });
            }
        } finally {
            setIsUpdating(false);
        }
    };

    const promoteToAdmin = async (userIdToPromote: string) => {
        try {
        } catch (error) {}
    };

    const demoteFromAdmin = async (userIdToDemote: string) => {
        try {
        } catch (error) {}
    };

    const isCurrUserAdmin = groupDetails.admin.includes(currUserId);

    return (
        <>
            <main
                className={`h-[calc(100%-0.875rem)] relative flex flex-col flex-nowrap rounded-md my-auto w-[calc(100%-0.975rem)] mx-auto bg-slate-900`}
            >
                <div className="size-full px-5 py-6 flex flex-nowrap gap-5">
                    <div
                        onClick={() => onBackButtonClick("Chat")}
                        className="p-0.5 px-1 hover:bg-gray-500 cursor-pointer rounded-sm size-fit"
                    >
                        <svg
                            className="size-7"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 -960 960 960"
                            fill="#e8eaed"
                        >
                            <path d="M360-240 120-480l240-240 56 56-144 144h568v80H272l144 144-56 56Z" />
                        </svg>
                    </div>

                    <div className="flex flex-col gap-8">
                        <h2 className="text-2xl font-semibold">
                            Edit group settings
                        </h2>

                        <form
                            className="flex flex-nowrap flex-col gap-4 max-w-sm"
                            onSubmit={formSubmitHandler}
                        >
                            <div>
                                <label className="text-[0.9rem] text-[#ccc] inline-block mb-1 font-light pl-[1.5px]">
                                    Name
                                </label>

                                <Input
                                    ref={groupNameRef}
                                    defaultValue={groupDetails.name}
                                    className="py-6 pl-4"
                                />
                            </div>

                            <div>
                                <label className="text-[0.9rem] text-[#ccc] inline-block mb-1 font-light pl-[1.5px]">
                                    Description
                                </label>

                                <textarea
                                    ref={groupDescriptionRef}
                                    defaultValue={groupDetails.description}
                                    className="block lg:w-[25rem] sm:w-[23rem] w-[18rem] resize-none min-h-[100px] rounded-md border border-input bg-background px-3 pl-4 py-2 pt-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>

                            <Button
                                disabled={isUpdating}
                                type="submit"
                                size={"sm"}
                                className="py-0 w-fit mt-4 ml-px disabled:cursor-not-allowed px-4"
                            >
                                {isUpdating && (
                                    <Loader2Icon className="size-4 animate-spin mr-1.5 mb-0.5" />
                                )}
                                Update
                            </Button>
                        </form>

                        <section className="flex flex-col items-start flex-nowrap gap-3.5 mt-6 pl-px">
                            <div className="">Group members:</div>

                            <ul className="max-h-72 max-w-44 bg-slate-700 rounded-md py-2 px-3 flex flex-col overflow-y-auto gap-1">
                                {groupDetails.members.map(
                                    (member: any, index: number) => {
                                        return (
                                            <>
                                                <DropdownMenu key={member._id}>
                                                    <DropdownMenuTrigger className="px-3 pr-[0.8rem] py-1.5 hover:bg-slate-600 rounded-md">
                                                        ~ {member.username}
                                                    </DropdownMenuTrigger>
                                                    {isCurrUserAdmin && (
                                                        <DropdownMenuContent className="p-2.5 flex flex-col flex-nowrap gap-2">
                                                            {isCurrUserAdmin &&
                                                                !member.isCreator && (
                                                                    <DropdownMenuItem className="cursor-pointer p-0">
                                                                        <button
                                                                            onClick={() =>
                                                                                promoteToAdmin(
                                                                                    member._id
                                                                                )
                                                                            }
                                                                            className="px-3 rounded-md py-2 bg-green-700 w-full"
                                                                        >
                                                                            Promote
                                                                            to
                                                                            admin
                                                                            &nbsp;&uarr;
                                                                        </button>
                                                                    </DropdownMenuItem>
                                                                )}

                                                            {currUserId ===
                                                                groupDetails
                                                                    .createdBy
                                                                    ?._id &&
                                                            member.isAdmin &&
                                                            currUserId !==
                                                                member._id ? (
                                                                <DropdownMenuItem className="cursor-pointer p-0">
                                                                    <button
                                                                        onClick={() =>
                                                                            demoteFromAdmin(
                                                                                member._id
                                                                            )
                                                                        }
                                                                        className="py-2 px-3 rounded-md bg-red-800 w-full"
                                                                    >
                                                                        Demote
                                                                        from
                                                                        admin
                                                                        &nbsp;&darr;
                                                                    </button>
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <></>
                                                            )}
                                                        </DropdownMenuContent>
                                                    )}
                                                </DropdownMenu>

                                                {index <
                                                    groupDetails.members
                                                        .length -
                                                        1 && (
                                                    <Separator
                                                        className="bg-black h-[1.5px]"
                                                        orientation="horizontal"
                                                    />
                                                )}
                                            </>
                                        );
                                    }
                                )}
                            </ul>
                        </section>

                        <AddUserButton socket={socket} groupId={groupId} />

                        <LeaveGroupButton socket={socket} groupId={groupId} />
                    </div>
                </div>
            </main>
        </>
    );
};

export default GroupSettings;
