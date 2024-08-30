"use client";

import { useGroupData, useMessages } from "@/app/clientHooks/useGroupData";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import axios from "@/lib/config/axios.config";
import {
    mediaFileSchemaClient,
    sendMessageInGroupSchemaClient,
    SendMessageInGroupSchemaClient,
} from "@/lib/validationSchemas/send-message";
import { formatTimeAgo } from "@/utils/dateformatter";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import {
    Loader2Icon,
    PaperclipIcon,
    SendHorizontalIcon,
    SettingsIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroll-component";
import GroupDetails from "./GroupDetails";

interface GroupBodyProps {
    groupId: string;
    currentUserId: string;
    className?: string;
}
interface SendMessageFormProps {
    groupId: string;
    onMessageCreation?: (message: any) => void;
}
interface GroupBodyNavBarProps {
    groupId: string;
}
interface GroupBodyMessagesContainerProps {
    groupId: string;
    currentUserId: string;
}

const SendMessageForm: React.FC<SendMessageFormProps> = ({
    groupId,
    onMessageCreation,
}) => {
    const {
        register,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = useForm<SendMessageInGroupSchemaClient>({
        resolver: zodResolver(sendMessageInGroupSchemaClient),
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const messageFormRef = useRef<HTMLFormElement>(null);

    const { toast } = useToast();

    const handleMessageCreation: SubmitHandler<
        SendMessageInGroupSchemaClient
    > = async (data) => {
        try {
            const formData = new FormData(messageFormRef.current!);
            const mediaFileInput = formData.get("mediaFile") as File;

            // validate the media file separately
            const validatedMediaFile = mediaFileSchemaClient.safeParse({
                mediaFile: formData.get("mediaFile"),
            });

            if (!validatedMediaFile.success) {
                toast({
                    title: "Error",
                    description: "Invalid media file",
                    variant: "destructive",
                });
            }

            if (
                !mediaFileInput ||
                mediaFileInput.size === 0 ||
                mediaFileInput.name === ""
            ) {
                formData.delete("mediaFile");
            }

            const response = await axios.post(
                `/api/v1/messages/group-messages/${groupId}`,
                formData
            );

            if (response.status !== 201) {
                toast({
                    title: response.data?.error.cause ?? "Error",
                    description:
                        response.data?.error.message ?? "Something went wrong",
                });
            } else {
                if (typeof onMessageCreation === "function") {
                    onMessageCreation(response.data?.data);
                }
                messageFormRef.current?.reset();
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast({
                    title: error.response?.data?.error?.cause ?? "Error",
                    description:
                        error.response?.data?.error?.message ??
                        "Something went wrong",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Something went wrong",
                    variant: "destructive",
                });
            }
        }
    };

    return (
        <>
            <form
                ref={messageFormRef}
                onSubmit={handleSubmit(handleMessageCreation)}
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
                    disabled={isSubmitting}
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
    groupId,
    currentUserId,
}) => {
    const { error, groupMessages, hasMoreMessages, setMoreMessages } =
        useMessages(groupId);

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
                className="bg-slate-900 grow px-2 py-1.5 flex flex-col-reverse overflow-y-auto"
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
                                                src={message.sender?.avatar}
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
                                        className={`chat-footer text-xs text-muted-foreground ${
                                            isMessageSentByCurrentUser
                                                ? "mr-px"
                                                : "ml-px"
                                        }`}
                                    >
                                        {formatTimeAgo(
                                            new Date(message.createdAt)
                                        )}
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

const GroupBodyNavBar: React.FC<GroupBodyNavBarProps> = ({ groupId }) => {
    const { isFetching, groupData, error } = useGroupData(groupId);

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
                    <ul className="flex flex-row list-none flex-nowrap justify-between px-2 py-1 rounded-t-md h-full items-center">
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
                            <DropdownMenuTrigger className="mr-3 hover:bg-slate-400 p-[0.3rem] rounded-[48%]">
                                <svg
                                    fill="#fef"
                                    className="height-auto w-5"
                                    version="1.1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 32.055 32.055"
                                >
                                    <g>
                                        <path d="M3.968,12.061C1.775,12.061,0,13.835,0,16.027c0,2.192,1.773,3.967,3.968,3.967c2.189,0,3.966-1.772,3.966-3.967C7.934,13.835,6.157,12.061,3.968,12.061z M16.233,12.061c-2.188,0-3.968,1.773-3.968,3.965c0,2.192,1.778,3.967,3.968,3.967s3.97-1.772,3.97-3.967C20.201,13.835,18.423,12.061,16.233,12.061z M28.09,12.061c-2.192,0-3.969,1.774-3.969,3.967c0,2.19,1.774,3.965,3.969,3.965c2.188,0,3.965-1.772,3.965-3.965S30.278,12.061,28.09,12.061z" />
                                    </g>
                                </svg>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent>
                                <SettingsIcon />
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
}) {
    return (
        <>
            <main
                className={`h-[calc(100%-0.875rem)] relative flex flex-col flex-nowrap rounded-md my-auto w-[calc(100%-0.975rem)] mx-auto bg-slate-900 ${className}`}
            >
                <GroupBodyNavBar groupId={groupId} />

                <GroupBodyMessagesContainer
                    groupId={groupId}
                    currentUserId={currentUserId}
                />

                <section className="h-[4.5rem] flex flex-row flex-nowrap items-center w-full bg-gray-600 py-2 rounded-b-md bottom-0">
                    <ul className="w-full rounded-b-md">
                        <SendMessageForm groupId={groupId} />
                    </ul>
                </section>
            </main>
        </>
    );
};

export default GroupBody;

export const dynamic = "force-dynamic";
