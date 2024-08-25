"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import axios from "@/lib/config/axios.config";
import { CheckedState } from "@radix-ui/react-checkbox";
import { AxiosError } from "axios";
import { ArrowDownIcon } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

interface Option {
    label: string;
    value: string;

    checked?: boolean;
}
interface MultiSelectProps {
    options: Option[];
    onChange: (selectedItems: string[]) => void;
    selectLabel: string;
    selectClassName?: string;
    selectItemClassName?: string;
    triggerClassName?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
    options,
    onChange,
    selectClassName,
    triggerClassName,
    selectItemClassName,
    selectLabel,
}) => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const [_Options, set_Options] = useState<Option[]>([]);

    useEffect(() => {
        set_Options(
            options.map((option) => {
                option.checked = false;
                return option;
            })
        );
    }, [options]);

    const handleCheckboxChange = (checked: CheckedState, id: number) => {
        if (_Options[id].checked) {
            setSelectedItems(
                selectedItems.filter((el) => el !== _Options[id].value)
            );
        } else {
            setSelectedItems((prevSelected) => [
                ...prevSelected,
                _Options[id].value,
            ]);
        }

        _Options[id].checked = !_Options[id].checked;
    };

    useEffect(() => {
        onChange(selectedItems);
    }, [selectedItems, onChange]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div style={{ position: "relative", display: "inline-block" }}>
            <Button
                type="button"
                variant={"secondary"}
                ref={buttonRef}
                className={`p-2 px-3 rounded-md cursor-pointer flex flex-row flex-nowrap gap-2 items-center ${triggerClassName}`}
                onClick={toggleDropdown}
            >
                {selectLabel}
                <ArrowDownIcon
                    className={`h-[1.1rem] transition pb-px duration-300 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </Button>

            {isOpen && (
                <div
                    ref={dropdownRef}
                    className={`absolute max-w-sm rounded-md top-[100%] l-0 mt-0.5 py-px flex flex-col flex-nowrap max-h-[200px] overflow-y-auto z-[1] ${selectClassName}`}
                >
                    {_Options.map((option, index) => (
                        <>
                            <div
                                key={option.value}
                                className={`font-medium flex flex-row pl-[.65rem] pr-2.5 gap-[1.15rem] items-center py-1.5 my-1 ${selectItemClassName}`}
                            >
                                <Checkbox
                                    id={`cbox-${index}`}
                                    checked={option.checked}
                                    onCheckedChange={(checked) =>
                                        handleCheckboxChange(checked, index)
                                    }
                                    className="bg-slate-500 h-5 w-5"
                                />

                                <label
                                    htmlFor={`cbox-${index}`}
                                    className="cursor-pointer pt-px text-ellipsis whitespace-nowrap max-w-fit overflow-hidden"
                                >
                                    {option.label}
                                </label>
                            </div>

                            {index + 1 < options.length && (
                                <hr role="separator" />
                            )}
                        </>
                    ))}
                </div>
            )}
        </div>
    );
};

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

        try {
            setIsCreatingGroup(true);

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
            <h2 className="text-3xl font-bold text-center mb-10">
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
                        className="w-[550px] resize-none min-h-[100px] rounded-md border border-input bg-background px-3 pl-4 py-2 pt-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </section>

                <MultiSelect
                    selectLabel="Select friends"
                    options={options}
                    selectClassName="bg-slate-700 px-2.5 py-2.5"
                    selectItemClassName="px-3.5 hover:bg-gray-600 rounded-sm"
                    onChange={handleSelectionChange}
                />

                {error && (
                    <p className="text-sm text-red-500 text-center">{error}</p>
                )}

                <Button className="mt-6" type="submit">
                    Submit
                </Button>
            </form>
        </main>
    );
};

export default Page;
