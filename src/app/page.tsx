"use client";

import GroupBody from "@/components/custom/Group/GroupBody";
import GroupPreviewArea from "@/components/custom/Group/GroupPreviewArea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import axios from "@/lib/config/axios.config";
import { type TGroup } from "@/models/group.model";
import { ArrowDownSquare, SearchIcon, User2Icon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
    const [currentSelectedGroup, setCurrentSelectedGroup] =
        useState<TGroup | null>(null);
    const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
    const [groups, setGroups] = useState<TGroup[] | null>(null);

    const { toast } = useToast();

    const fetchUserGroups = async () => {
        try {
            const response = await axios.get("/api/v1/users/groups");
            if (response.status !== 200) {
                return null;
            }

            return response.data.data.joinedGroups;
        } catch (error) {
            return null;
        }
    };

    useEffect(() => {
        (async function () {
            const responseObject = await fetchUserGroups();
            setGroups(responseObject);
        })();
    }, []);

    return (
        <>
            <main className="h-screen w-screen flex flex-col flex-nowrap">
                <nav className="h-[5rem] w-full bg-slate-700">
                    <ul className="h-full flex flex-row items-center justify-between">
                        <div className="relative lg:ml-16 ml-2">
                            <Input
                                placeholder="Search here ..."
                                className="lg:w-[450px] w-[300px] py-5"
                                type="text"
                            />
                            <button className="rounded-r-md absolute h-full right-0 top-0 px-2.5 bg-gray-500">
                                <SearchIcon className="h-5" />
                            </button>
                        </div>

                        <div className="flex flex-row flex-nowrap gap-10">
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <div className="bg-transparent rounded-md py-0.5 px-2.5 hover:bg-slate-500 text-2xl">
                                        <span>+</span>{" "}
                                        <ArrowDownSquare className="inline-block pb-0.5" />
                                    </div>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="px-2 py-2">
                                    <DropdownMenuItem>
                                        <Link href={"/friends/add"}>
                                            Add a friend
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem>
                                        <Link href={"/groups/new"}>
                                            Create a new group
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Link
                                className="rounded-[50%] mr-2 lg:mr-10 border-[2px] border-slate-200 p-[5px] pb-[5.25px]"
                                href="/user"
                            >
                                <User2Icon />
                            </Link>
                        </div>
                    </ul>
                </nav>

                <section className="grid grid-cols-[1fr_1px_2.5fr] w-full h-full">
                    <section className="h-full w-full p-2">
                        <GroupPreviewArea groups={groups} />
                    </section>
                    <Separator orientation="vertical" />
                    <section className="h-full w-full">
                        <GroupBody group={undefined} />
                    </section>
                </section>
            </main>
        </>
    );
}
