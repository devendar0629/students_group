"use client";

import { formatTimeAgo } from "@/utils/dateformatter";
import UserAvatar from "../UserAvatar";
import { forwardRef, useRef } from "react";
import { convertFileNameToNormal } from "@/utils/convertFileName";

interface GroupMessageProps {
    message: any;
    currUserId: string;
}

interface GroupMessageFilePreviewProps {
    mediaFile: any;
}

const GroupMessageFilePreview = forwardRef<
    HTMLAnchorElement,
    GroupMessageFilePreviewProps
>(({ mediaFile }, ref) => {
    let url = mediaFile.link;
    const len = url.length;
    const extension = url.slice(len - 3, len);

    if (extension === "mp4") {
        url = `${mediaFile.link.slice(0, len - 4)}.jpg`;
    }

    const normalFileName = convertFileNameToNormal(mediaFile.fileName);

    return (
        <>
            <a
                ref={ref}
                href={`/api/v1/media/download?url=${mediaFile.link}&filename=${normalFileName}`}
                download
            >
                <img
                    className="h-[150px] rounded-md w-full"
                    src={url}
                    alt="Post media preview"
                />
            </a>
        </>
    );
});

GroupMessageFilePreview.displayName = "GroupMessageFilePreview";

const GroupMessage: React.FC<GroupMessageProps> = function ({
    message,
    currUserId,
}) {
    const isSentByCurrUser = currUserId === message.sender._id;
    const anchorRef = useRef<HTMLAnchorElement>(null);

    const handleDownloadClick = () => {
        if (!message.mediaFile || !anchorRef.current) return;

        anchorRef.current.click();
    };

    return (
        <>
            <div
                className={`flex flex-col flex-nowrap size-full items-start ${
                    isSentByCurrUser && "items-end"
                }`}
            >
                <section
                    className={`flex gap-3.5 items-start my-2.5 ${
                        isSentByCurrUser && "flex-row-reverse"
                    }`}
                >
                    <UserAvatar
                        className="size-9 rounded-full"
                        avatarUrl={message.sender.avatar}
                    />

                    <div
                        className={`px-3.5 pt-3 pb-4 bg-slate-700 rounded-br-lg rounded-bl-lg flex flex-col gap-2 ${
                            isSentByCurrUser
                                ? " rounded-tl-lg"
                                : " rounded-tr-lg"
                        }`}
                    >
                        <div className="flex gap-2 justify-between items-baseline">
                            <p className="font-semibold">
                                {isSentByCurrUser
                                    ? "You"
                                    : `~ ${message.sender.username}`}
                            </p>
                            <time className="opacity-60 text-[0.675rem]">
                                {formatTimeAgo(new Date(message.createdAt))}
                            </time>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <p className="text-[0.885rem]">{message.content}</p>

                            {!!message.mediaFile && (
                                <>
                                    <div className="size-full relative">
                                        <GroupMessageFilePreview
                                            mediaFile={message.mediaFile}
                                            ref={anchorRef}
                                        />

                                        <div className="bg-gray-900/50 opacity-80 size-full absolute top-0 rounded-md flex items-center justify-center">
                                            <button
                                                type="button"
                                                className="rounded-full bg-black/60 p-1.5"
                                                onClick={handleDownloadClick}
                                            >
                                                <svg
                                                    className="cursor-pointer"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    height="24px"
                                                    viewBox="0 -960 960 960"
                                                    width="24px"
                                                    fill="#e8eaed"
                                                >
                                                    <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default GroupMessage;
