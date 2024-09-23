"use client";

import GroupBody from "@/components/custom/Group/GroupBody";
import GroupPreviewArea from "@/components/custom/Group/GroupPreviewArea";
import SendFriendRequestPopup from "@/components/custom/Group/SendFriendRequestPopup";
import StatusCircle from "@/components/custom/StatusCircle";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import axios from "@/lib/config/axios.config";
import { type TGroup } from "@/models/group.model";
import { TUser } from "@/models/user.model";
import { extractGroupNumberFromTag } from "@/utils/extractGroupIdFromTag";
import { SearchIcon, TimerIcon, User2Icon, UsersRoundIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useGroups } from "./clientHooks/useGroupData";

export default function Home() {
    const [currentSelectedGroup, setCurrentSelectedGroup] = useState<
        HTMLDivElement | undefined
    >();
    const [currentLoggedInUser, setCurrentLoggedInUser] = useState<
        TUser & { _id: string }
    >();
    const [groups, setGroups] = useState<(TGroup & { _id: string })[] | null>(
        null
    );
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<
        "CONNECTED" | "DISCONNECTED"
    >("DISCONNECTED");
    const [isFetchingGroups, setIsFetchingGroups] = useState<boolean>(false);

    const { joinedGroups } = useGroups(socket);

    useEffect(() => {
        const _socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL!, {
            withCredentials: true,
            reconnectionAttempts: 3,
        });

        _socket.on("connect", () => {
            setSocket(_socket);
            setConnectionStatus("CONNECTED");
        });

        _socket.on("disconnect", () => {
            setConnectionStatus("DISCONNECTED");
        });

        return () => {
            _socket.close();
        };
    }, []);

    const fetchUserGroups = async () => {
        setIsFetchingGroups(true);
        try {
            const response = await axios.get("/api/v1/users/groups");
            if (response.status !== 200) {
                return null;
            }

            return response.data.data.joinedGroups;
        } catch (error) {
            return null;
        } finally {
            setIsFetchingGroups(false);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const response = await axios.get("api/v1/users/get-current-user");

            if (response.status === 200) {
                return response.data?.data;
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    };

    useEffect(() => {
        (async function () {
            const responseObject = await fetchUserGroups();
            setGroups(responseObject);

            const currentUser = await fetchCurrentUser();
            setCurrentLoggedInUser(currentUser);
        })();
    }, []);

    return (
        <>
            <main className="h-screen flex flex-col flex-nowrap">
                <nav className="h-[5rem] bg-slate-700">
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

                        <section className="flex flex-row gap-2 flex-nowrap text-nowrap items-center">
                            <p className="text-sm opacity-70">
                                Connection status:
                            </p>
                            <StatusCircle
                                status={connectionStatus}
                                className={"size-3 mb-px"}
                            />
                        </section>

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
                        <GroupPreviewArea
                            isFetching={isFetchingGroups}
                            onSelectedGroupChange={(node: HTMLDivElement) =>
                                setCurrentSelectedGroup(node)
                            }
                            groups={groups}
                        />
                    </section>

                    <Separator orientation="vertical" />

                    <section className="grow max-h-[calc(100vh-5rem)] flex flex-nowrap flex-col">
                        {groups && !!currentSelectedGroup ? (
                            <GroupBody
                                socket={socket}
                                currentUserId={currentLoggedInUser?._id!}
                                groupId={
                                    groups[
                                        extractGroupNumberFromTag(
                                            currentSelectedGroup
                                        )
                                    ]._id
                                }
                            />
                        ) : (
                            <main className="h-[calc(100%-0.875rem)] grid place-content-center rounded-md my-auto w-[calc(100%-0.775rem)] text-lg mx-auto">
                                <p>No group selected .</p>
                            </main>
                        )}
                    </section>
                </section>
            </main>
        </>
    );
}
