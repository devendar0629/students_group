"use client";

import MultiSelect, { Option } from "@/components/custom/MultiSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "@/lib/config/axios.config";
import { AxiosError } from "axios";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";

const Page: React.FC = () => {
    const [options, setOptions] = useState<Option[]>([]);
    const fetchUserFriends = async () => {
        try {
            const response = await axios.get("/api/v1/friends");

            if (response.status === 200) {
                return response.data.data?.friends;
            } else return [];
        } catch (error) {
            console.log(error);
            return [];
        }
    };

    // Form related stuff
    const nameRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const [error, setError] = useState<string>("");
    const [isCreatingGroup, setIsCreatingGroup] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        (async () => {
            const friends = await fetchUserFriends();

            setOptions(
                friends.map((friend: any) => {
                    return { label: friend.username, value: friend._id };
                })
            );
        })();
    }, []);

    const [selected, setSelected] = useState<string[]>([]);
    const handleSelectionChange = (selectedItems: string[]) => {
        setSelected(selectedItems);
    };

    const validateInputs = (): { success: boolean; error: string } => {
        let result = {
            success: true,
            error: "",
        };

        if (!nameRef.current?.value) {
            result.error = "Name is required";
            result.success = false;
        }
        if (selected.length === 0) {
            result.error = "Group should have atleast one member";
            result.success = false;
        }

        return result;
    };

    const handleGroupCreation: React.FormEventHandler = async (e) => {
        e.preventDefault();

        // validate the input
        const validate = validateInputs();
        if (!validate.success) {
            setError(validate.error);
            return;
        }

        setIsCreatingGroup(true);
        try {
            const response = await axios.post("/api/v1/groups", {
                name: nameRef.current?.value,
                description: descriptionRef.current?.value,
                members: selected,
            });

            if (response.status !== 201) {
                setError(
                    response.data?.error.message ??
                        "Something went wrong while creating the group"
                );
            }

            router.replace("/");
        } catch (error) {
            if (error instanceof AxiosError) {
                setError(error.response?.data?.error.messaage);
            } else {
                setError("Something went wrong while creating group");
            }
        } finally {
            setIsCreatingGroup(false);
        }
    };

    return (
        <main className="h-screen w-full grid place-content-center">
            <h2 className="text-4xl font-bold text-center mb-16">
                Create a Group
            </h2>

            <form
                onSubmit={handleGroupCreation}
                className="lg:max-w-screen-lg md:w-[558px] sm:w-[392px] rounded-md px-6 py-4 flex flex-col flex-nowrap gap-6"
            >
                <section className="flex flex-row flex-nowrap gap-3 items-center">
                    <label className="mb-1">Name </label>
                    <Input ref={nameRef} required className="" type="text" />
                </section>

                <section className="flex flex-row flex-nowrap gap-3">
                    <label className="mt-0.5">Description </label>
                    <textarea
                        ref={descriptionRef}
                        className="w-[550px] resize-none min-h-[100px] rounded-md border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </section>

                <MultiSelect
                    selectLabel="Select friends"
                    options={options}
                    selectClassName="bg-slate-700 px-2.5 py-2.5"
                    triggerClassName="pl-4"
                    selectItemClassName="px-3.5 hover:bg-gray-600 rounded-sm"
                    onChange={handleSelectionChange}
                />

                {error && (
                    <p className="text-sm text-red-500 text-center">{error}</p>
                )}

                <Button
                    className="mt-6 flex flex-row flex-nowrap gap-2 items-center text-[0.925rem] font-semibold"
                    type="submit"
                    disabled={isCreatingGroup}
                >
                    {isCreatingGroup && (
                        <Loader2Icon className="animate-spin size-[1.09rem] mb-[1.5px]" />
                    )}
                    Create
                </Button>
            </form>
        </main>
    );
};

export default Page;
