import axios from "@/lib/config/axios.config";
import { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";

interface MongooseDocument {
    _id: string;
    createdAt: string;
    updatedAt: string;
}

interface GroupMessage extends MongooseDocument {
    content: string;
    mediaFile?: {
        _id: string;
        fileName: string;
        link: string;
        sender: string; // _id of the sender
    } & MongooseDocument;
    sender: string;
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

export const useMessages = (groupId: string) => {
    const [page, setPage] = useState<number>(2);
    const [fetching, setFetching] = useState<boolean>(false);
    const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [groupMessages, setGroupMessages] = useState<any[]>([]);

    const fetchMessages = async (pageNumber: number) => {
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
        }
    };

    const setInitialMessages = async () => {
        const response = await fetchMessages(1);

        if (response.error) {
            setError(response.error);
        } else {
            setGroupMessages(response.data?.messages);
        }
    };
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

    useEffect(() => {
        setHasMoreMessages(true);
        setPage(2);

        (async () => {
            await setInitialMessages();
        })();
    }, [groupId]);

    return {
        page,
        fetching,
        groupMessages,
        hasMoreMessages,
        setMoreMessages,
        error,
    };
};

export const useGroupData = (groupId: string) => {
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [groupData, setGroupData] = useState<Group | undefined>(undefined);

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
            } else setError("Something went wrong while fetching group data");

            return undefined;
        }
    };

    useEffect(() => {
        (async () => {
            setIsFetching(true);
            const groupData = await fetchGroupData();
            setGroupData(groupData);

            setIsFetching(false);
        })();
    }, [groupId]);

    return { isFetching, error, groupData };
};