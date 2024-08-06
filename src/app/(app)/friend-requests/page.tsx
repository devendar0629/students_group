"use client";

import { useEffect, useRef, useState } from "react";
import FriendRequest from "./friend_request";
import axios from "@/lib/config/axios.config";
import { TFriendRequest } from "@/models/friend_request.model";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { Separator } from "@/components/ui/separator";
import { Loader2Icon } from "lucide-react";
import { TUser } from "@/models/user.model";

interface PageProps {}

const Page: React.FC<PageProps> = function () {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [friendRequests, setFriendRequests] = useState<
        (TFriendRequest & { _id: string })[] | null
    >([]);
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [currentUser, setCurrentUser] = useState<
        (TUser & { _id: string }) | null
    >(null);

    const fetchFriendRequests = async () => {
        try {
            const response = await axios.get(`/api/v1/friend-requests`);
            return response.data.data;
        } catch (error) {
            return null;
        }
    };

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            // try to fetch the next page
            const responseRequests = await fetchFriendRequests();
            const responseUser = await axios.get(
                "/api/v1/users/get-current-user"
            );
            setIsLoading(false);

            setCurrentUser(responseUser.data.data);
            setFriendRequests(responseRequests);
        })();
    }, []);

    return (
        <>
            <main className="h-screen w-screen pt-8 pl-8 flex flex-col flex-nowrap">
                <h2 className="lg:text-3xl text-2xl font-semibold mb-8">
                    Friend Requests and Invites
                </h2>

                <section className="grow pl-2.5 text-lg lg:max-w-lg max-w-sm">
                    {isLoading && (
                        <div className="text-lg">
                            <Loader2Icon className="animate-spin inline-block mr-1.5" />{" "}
                            Loading
                        </div>
                    )}

                    {friendRequests && friendRequests.length > 0 && (
                        <Virtuoso
                            style={{
                                maxHeight: "calc(100% - 4rem)",
                            }}
                            className="max-w-lg"
                            ref={virtuosoRef}
                            data={friendRequests!}
                            itemContent={(currIndex, currFriendRequest) => (
                                <>
                                    <FriendRequest
                                        isSender={
                                            currentUser?._id.toString() ===
                                            currFriendRequest.sender
                                        }
                                        friendRequest={currFriendRequest}
                                    />
                                    {friendRequests &&
                                        currIndex <
                                            friendRequests.length - 1 && (
                                            <Separator orientation="horizontal" />
                                        )}
                                </>
                            )}
                        />
                    )}

                    {!friendRequests && <p>Something went wrong</p>}
                    {!isLoading && friendRequests?.length === 0 && (
                        <p className="text-[.95rem]">No friend requests yet.</p>
                    )}
                </section>
            </main>
        </>
    );
};

export default Page;
