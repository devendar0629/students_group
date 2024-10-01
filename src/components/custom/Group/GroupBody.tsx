"use client";

import { useGroupData, useMessages } from "@/app/clientHooks/useGroupData";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import {
    sendMessageInGroupSchemaClient,
    SendMessageInGroupSchemaClient,
} from "@/lib/validationSchemas/send-message";
import { formatTimeAgo } from "@/utils/dateformatter";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Loader2Icon,
    PaperclipIcon,
    SendHorizontalIcon,
    Settings,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import GroupDetails from "./GroupDetails";
import { Socket } from "socket.io-client";
import maleAvatarPlaceholder from "@/../public/male-avatar-placeholder.jpg";
import GroupSettings from "./GroupSettings";

export type ActiveTab = "Chat" | "Settings";

interface GroupBodyProps {
    groupId: string;
    currentUserId: string;
    className?: string;
    socket: Socket | null;
}
interface SendMessageFormProps {
    groupId: string;
    onMessageCreation?: (message: any) => void;
    socket: Socket | null;
}
interface GroupBodyNavBarProps {
    onActiveTabChange: (value: ActiveTab) => void;
    groupObj: {
        isFetching: boolean;
        groupData: any;
        error: string;
    };
}
interface GroupBodyMessagesContainerProps {
    currGroupId: string;
    currentUserId: string;
    socket: Socket | null;
}

const SendMessageForm: React.FC<SendMessageFormProps> = ({
    groupId,
    onMessageCreation,
    socket,
}) => {
    const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SendMessageInGroupSchemaClient>({
        resolver: zodResolver(sendMessageInGroupSchemaClient),
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const messageFormRef = useRef<HTMLFormElement>(null);

    const { toast } = useToast();

    const handleMessageEmission: SubmitHandler<
        SendMessageInGroupSchemaClient
    > = async (data) => {
        if (!socket) return;

        setIsSendingMessage(true);

        try {
            const file = fileInputRef.current?.files?.[0];

            if (file) {
                file.arrayBuffer().then((buffer) => {
                    socket.timeout(60000).emit(
                        "client-room-message",
                        {
                            roomName: groupId,
                            content: data.content,
                            mediaFile: {
                                buffer,
                                mimeType: file.type,
                                fileNameWithoutExtension: file.name.slice(
                                    0,
                                    file.name.lastIndexOf(".")
                                ),
                            },
                        },
                        (error: Error | null, data: any | null) => {
                            if (error) {
                                toast({
                                    title: "Error",
                                    description:
                                        "Something went wrong while sending message",
                                    variant: "destructive",
                                });
                            }

                            setIsSendingMessage(false);
                        }
                    );
                });
            } else {
                socket.emit(
                    "client-room-message",
                    {
                        roomName: groupId,
                        content: data.content,
                        mediaFile: null,
                    },
                    (error: Error | null, data: any | null) => {
                        if (error) {
                            toast({
                                title: "Error",
                                description:
                                    "Something went wrong while sending message",
                                variant: "destructive",
                            });
                        }

                        setIsSendingMessage(false);
                    }
                );
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong while sending the message",
                variant: "destructive",
            });

            setIsSendingMessage(false);
        }
    };

    return (
        <>
            <form
                ref={messageFormRef}
                onSubmit={handleSubmit(handleMessageEmission)}
                className="w-full flex flex-row gap-3.5 items-center flex-nowrap"
            >
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-12 w-[3.125rem] grid place-content-center ml-3 cursor-pointer p-1.5 rounded-md hover:bg-gray-500"
                >
                    <input
                        ref={fileInputRef}
                        name="mediaFile"
                        className="hidden"
                        type="file"
                    />

                    <PaperclipIcon className="rounded-md my-auto mx-auto" />
                </div>

                <input
                    {...register("content")}
                    placeholder="Type a message ..."
                    type="text"
                    className={`grow pl-5 h-12 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus:ring- outline-none ${
                        errors.content
                            ? "ring-2 ring-offset-0 ring-red-500"
                            : ""
                    }`}
                />

                <button
                    disabled={isSendingMessage}
                    type="submit"
                    className={`rounded-md p-1 mr-2.5 h-12 w-[3.125rem] hover:bg-gray-500 disabled:opacity-65 disabled:cursor-not-allowed`}
                >
                    <SendHorizontalIcon className="mx-auto" />
                </button>
            </form>
        </>
    );
};

const GroupBodyMessagesContainer: React.FC<GroupBodyMessagesContainerProps> = ({
    currGroupId,
    currentUserId,
    socket,
}) => {
    const {
        error,
        groupMessages,
        hasMoreMessages,
        setMoreMessages,
        addMessage,
    } = useMessages(currGroupId);

    useEffect(() => {
        const serverRoomMessageHandler = (roomId: string, message: any) => {
            if (currGroupId === roomId) {
                addMessage(message);
            }
        };

        socket?.on("server-room-message", serverRoomMessageHandler);

        return () => {
            socket?.removeListener(
                "server-room-message",
                serverRoomMessageHandler
            );
        };
    }, [addMessage, currGroupId, socket]);

    const { toast } = useToast();
    if (error) {
        toast({
            title: "Error",
            description: error,
            variant: "destructive",
        });
    }

    const messageContainerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        // Scroll to the bottom of messages every time the group messages change
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop =
                messageContainerRef.current?.scrollHeight;
        }
    }, [groupMessages]);

    return (
        <>
            <section
                ref={messageContainerRef}
                id="messagesContainer"
                className="bg-slate-900 grow px-2.5 lg:px-3.5 py-1.5 flex flex-col-reverse overflow-y-auto"
            >
                <InfiniteScroll
                    scrollThreshold={0.95}
                    dataLength={groupMessages.length}
                    next={setMoreMessages}
                    hasMore={hasMoreMessages}
                    inverse={true}
                    loader={
                        <h4 className="bg-transparent text-center">
                            Loading messages ...
                        </h4>
                    }
                    scrollableTarget="messagesContainer"
                >
                    {groupMessages?.map((message: any) => {
                        const isMessageSentByCurrentUser =
                            currentUserId === String(message.sender?._id);

                        return (
                            <>
                                <div
                                    key={message._id}
                                    className={`chat ${
                                        isMessageSentByCurrentUser
                                            ? "chat-end"
                                            : "chat-start"
                                    }`}
                                >
                                    {/* Sender avatar */}
                                    <div className="chat-image avatar">
                                        <div className="w-10 rounded-full">
                                            <Image
                                                width={40}
                                                height={40}
                                                alt="message sender avatar image"
                                                src={
                                                    message.sender?.avatar ||
                                                    maleAvatarPlaceholder.src
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Chat message content */}
                                    <div
                                        className={`chat ${
                                            isMessageSentByCurrentUser
                                                ? "chat-end"
                                                : "chat-start"
                                        }`}
                                    >
                                        <div
                                            className={`chat-bubble ${
                                                isMessageSentByCurrentUser
                                                    ? "chat-bubble-primary"
                                                    : "chat-bubble-secondary"
                                            }`}
                                        >
                                            {message.content}
                                        </div>
                                    </div>

                                    <div
                                        className={`chat-footer text-xs text-muted-foreground line-clamp-1 @footer-container ${
                                            isMessageSentByCurrentUser
                                                ? "mr-px"
                                                : "ml-px"
                                        }`}
                                    >
                                        <div className="flex flex-nowrap gap-1">
                                            <span className="overflow-hidden max-w-min text-ellipsis w-full line-clamp-1">
                                                ~{message.sender.username}
                                            </span>{" "}
                                            |{" "}
                                            {formatTimeAgo(
                                                new Date(message.createdAt)
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })}
                </InfiniteScroll>

                {!hasMoreMessages && (
                    <p className="text-muted-foreground text-sm text-center">
                        -- Reached the end --
                    </p>
                )}
            </section>
        </>
    );
};

const GroupBodyNavBar: React.FC<GroupBodyNavBarProps> = ({
    onActiveTabChange,
    groupObj,
}) => {
    const { isFetching, groupData, error } = groupObj;

    const { toast } = useToast();
    if (error) {
        toast({
            title: "Error",
            description: error,
            variant: "destructive",
        });
    }

    return (
        <>
            <nav className="h-16 bg-gray-600 py-1.5 rounded-t-md">
                {isFetching ? (
                    <p className="text-center my-auto h-full py-1 flex flex-nowrap items-center justify-center flex-row gap-2.5">
                        <Loader2Icon className="animate-spin h-5 mt-px" />
                        Loading ...
                    </p>
                ) : (
                    <ul className="flex flex-row list-none flex-nowrap justify-between px-2 pr-2.5 py-1 rounded-t-md h-full items-center">
                        <GroupDetails groupDetails={groupData}>
                            <li className="flex flex-col flex-nowrap justify-center font-semibold ml-3.5 rounded-md px-2.5 pt-px pb-1.5 hover:bg-gray-500 hover:cursor-pointer">
                                <p className="text-[1.25rem] ml-px font-semibold">
                                    {groupData?.name}
                                </p>
                                <span className="text-muted-foreground text-xs">
                                    {groupData?.members.length} members
                                </span>
                            </li>
                        </GroupDetails>

                        <DropdownMenu>
                            <DropdownMenuTrigger className="mr-3 hover:bg-slate-400 p-[0.2rem] rounded-full">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="24px"
                                    viewBox="0 -960 960 960"
                                    width="24px"
                                    fill="#e8eaed"
                                >
                                    <path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z" />
                                </svg>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="p-2.5 rounded-xl lg:mr-4 mr-2.5 space-y-1">
                                {/* Dropdown menu items start */}

                                <DropdownMenuItem
                                    onClick={() =>
                                        onActiveTabChange("Settings")
                                    }
                                    className="flex flex-row items-center gap-2.5 pl-2 pr-3 cursor-pointer "
                                >
                                    <Settings className="size-[1.1rem]" />{" "}
                                    <p className="text-sm">Settings</p>
                                </DropdownMenuItem>

                                {/* Dropdown menu items end */}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </ul>
                )}
            </nav>
        </>
    );
};

const GroupBody: React.FC<GroupBodyProps> = function ({
    groupId,
    currentUserId,
    className,
    socket,
}) {
    const [currentActiveTab, setCurrentActiveTab] = useState<ActiveTab>("Chat");
    const { isFetching, error, groupData, updateGroupDetails } =
        useGroupData(groupId);

    useEffect(() => {
        // This will forcefully place the chat screen of current group
        // if any other group's settings page is open
        setCurrentActiveTab("Chat");
    }, [groupId]);

    return (
        <>
            {currentActiveTab === "Chat" && (
                <main
                    className={`h-[calc(100%-0.875rem)] relative flex flex-col flex-nowrap rounded-md my-auto w-[calc(100%-0.975rem)] mx-auto bg-slate-900 ${className}`}
                >
                    <GroupBodyNavBar
                        groupObj={{ isFetching, error, groupData }}
                        onActiveTabChange={(value: ActiveTab) =>
                            setCurrentActiveTab(value)
                        }
                    />

                    <GroupBodyMessagesContainer
                        currGroupId={groupId}
                        currentUserId={currentUserId}
                        socket={socket}
                    />

                    <section className="h-[4.5rem] flex flex-row flex-nowrap items-center w-full bg-gray-600 py-2 rounded-b-md bottom-0">
                        <ul className="w-full rounded-b-md">
                            <SendMessageForm
                                socket={socket}
                                groupId={groupId}
                            />
                        </ul>
                    </section>
                </main>
            )}

            {currentActiveTab === "Settings" && (
                <GroupSettings
                    socket={socket}
                    groupDetails={groupData}
                    groupId={groupId}
                    currUserId={currentUserId}
                    onGroupDetailsChange={(name, description) => {
                        updateGroupDetails({ name, description });
                    }}
                    onBackButtonClick={(value) => setCurrentActiveTab(value)}
                />
            )}
        </>
    );
};

export default GroupBody;

export const dynamic = "force-dynamic";
