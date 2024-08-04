"use client";

import GroupBody from "@/components/custom/Group/GroupBody";
import GroupPreviewArea from "@/components/custom/Group/GroupPreviewArea";
import SendFriendRequestPopup from "@/components/custom/Group/SendFriendRequestPopup";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import axios from "@/lib/config/axios.config";
import { type TGroup } from "@/models/group.model";
import {
    ArrowDownSquare,
    SearchIcon,
    TimerIcon,
    User2Icon,
    UsersRoundIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
    const [currentSelectedGroup, setCurrentSelectedGroup] =
        useState<TGroup | null>(null);
    const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
    const [groups, setGroups] = useState<TGroup[] | null>(null);

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
                        <div className="lg:ml-16 ml-2 flex flex-row flex-nowrap gap-5 items-center">
                            <div className="relative">
                                <Input
                                    placeholder="Search here ..."
                                    className="lg:w-[450px] w-[300px] py-5"
                                    type="text"
                                />
                                <button className="rounded-r-md absolute h-full right-0 top-0 px-2.5 bg-gray-500">
                                    <SearchIcon className="h-5" />
                                </button>
                            </div>

                            <Link
                                className="font-semibold hover:underline hover:text-blue-500 hover:underline-offset-4"
                                href="/friends"
                            >
                                Friends
                            </Link>
                        </div>

                        <div className="flex flex-row flex-nowrap gap-6 items-center">
                            <Link
                                className="rounded-[50%] relative bg-transparent p-2.5 hover:bg-slate-500 text-2xl"
                                href="/friend-requests"
                            >
                                <UsersRoundIcon />
                                <TimerIcon className="absolute bottom-[0.415rem] right-0 h-3" />
                            </Link>

                            <SendFriendRequestPopup />
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
