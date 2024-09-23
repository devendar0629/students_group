import axios from "@/lib/config/axios.config";
import { AxiosError } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

interface MongooseDocument {
    _id: string;
    createdAt: string;
    updatedAt: string;
}
interface Group extends MongooseDocument {
    admin: {
        _id: string;
        name: string;
        username: string;
        avatar: string;
    };
    createdBy: {
        _id: string;
        name: string;
        username: string;
        avatar: string;
    };
    description: string;
    name: string;
    members: {
        _id: string;
        name: string;
        username: string;
        avatar: string;
    }[];
}

export const useGroups = (socket: Socket | null) => {
    const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);

    socket?.once("joined-groups", (groups) => {
        setJoinedGroups(groups);
    });

    return { joinedGroups };
};

export const useMessages = (groupId: string) => {
    const [page, setPage] = useState<number>(2);
    const [fetching, setFetching] = useState<boolean>(false);
    const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [groupMessages, setGroupMessages] = useState<any[]>([]);

    const fetchMessages = useCallback(
        async (pageNumber: number) => {
            setFetching(true);

            try {
                const response = await axios.get(
                    `/api/v1/messages/group-messages/${groupId}?page=${pageNumber}`
                );

                if (response.status !== 200) {
                    return {
                        data: null,
                        error: response.data.error?.message,
                    };
                } else {
                    return {
                        error: null,
                        data: {
                            groupId: response.data.data?._id,
                            messages: response.data?.data?.messages,
                        },
                    };
                }
            } catch (error) {
                if (error instanceof AxiosError) {
                    return {
                        data: null,
                        error:
                            error.response?.data?.error.message ??
                            "Something went wrong while fetching group messages",
                    };
                } else {
                    return {
                        data: null,
                        error: "Something went wrong while fetching group messages",
                    };
                }
            } finally {
                setFetching(false);
            }
        },
        [groupId]
    );

    const setMoreMessages = async () => {
        if (!hasMoreMessages) {
            return;
        }
        const response = await fetchMessages(page);

        if (error) {
            setError(response.error);
        } else {
            if (response.data?.messages?.length === 0) {
                setHasMoreMessages(false);
                return;
            }

            setGroupMessages((prevMessages) => [
                ...response.data?.messages,
                ...prevMessages,
            ]);

            setPage(page + 1);
        }
    };

    const addMessage = (message: any) => {
        setGroupMessages((prev) => [...prev, message]);
    };

    useEffect(() => {
        setHasMoreMessages(true);
        setPage(2);

        const setInitialMessages = async () => {
            const response = await fetchMessages(1);

            if (response.error) {
                setError(response.error);
            } else {
                setGroupMessages(response.data?.messages);
            }
        };

        (async () => {
            await setInitialMessages();
        })();
    }, [fetchMessages, groupId]);

    return {
        page,
        fetching,
        groupMessages,
        hasMoreMessages,
        setMoreMessages,
        error,
        addMessage,
    };
};

export const useGroupData = (groupId: string) => {
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [groupData, setGroupData] = useState<Group | undefined>(undefined);

    useEffect(() => {
        const fetchGroupData = async () => {
            try {
                const response = await axios.get(`/api/v1/groups/${groupId}`);

                if (response.status !== 200) {
                    setError(response.data.data?.error?.message);
                    return undefined;
                } else {
                    return response.data?.data;
                }
            } catch (error) {
                if (error instanceof AxiosError) {
                    setError(
                        error.response?.data?.error.message ??
                            "Something went wrong while fetching group data"
                    );
                } else
                    setError("Something went wrong while fetching group data");

                return undefined;
            }
        };

        (async () => {
            setIsFetching(true);
            const groupData = await fetchGroupData();
            setGroupData(groupData);

            setIsFetching(false);
        })();
    }, [groupId]);

    return { isFetching, error, groupData };
};
