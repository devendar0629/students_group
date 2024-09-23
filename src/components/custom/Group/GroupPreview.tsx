"use client";

import { convertFileNameToNormal } from "@/utils/convertFileName";

interface GroupPreviewProps {
    group: any;
    className?: string;
}

const GroupPreview: React.FC<GroupPreviewProps> = function ({
    group,
    className,
}) {
    if (!group) {
        return <>Empty</>;
    }

    // No group messages
    if (!group.messages || (group.messages && group.messages.length === 0)) {
        return (
            <>
                <div
                    className={`w-full h-16 bg-gray-700 flex flex-col flex-nowrap justify-center pl-3 gap-0.5 ${className}`}
                >
                    <p className="font-semibold pl-px whitespace-nowrap lg:w-[25rem] md:w-[16.5rem] sm:w-[14rem] w-[10rem]">
                        {group.name}
                    </p>
                    <div className="text-[rgba(255,255,255,.6)] mt-0.5 text-[.925rem] ml-0.5 font-semibold text-ellipsis whitespace-nowrap lg:w-[25rem] md:w-[16.5rem] sm:w-[14rem]">
                        No messages yet.
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div
                className={`w-full h-16 bg-gray-700 flex flex-col flex-nowrap justify-center pl-3 gap-0.5 ${className}`}
            >
                <p className="font-semibold pl-px">{group.name}</p>
                <div>
                    <div className="text-[rgba(255,255,255,.6)] flex flex-row flex-nowrap gap-1 mt-0.5 text-[.925rem] font-light max-w-fit">
                        <p className="font-medium">
                            ~{group.messages.sender.name}:{" "}
                        </p>

                        {/* Show media file name if it exists */}
                        {group.messages.mediaFile ? (
                            <p className="text-ellipsis overflow-hidden whitespace-nowrap lg:w-[25rem] md:w-[16.5rem] sm:w-[14rem] w-[10rem]">
                                {convertFileNameToNormal(
                                    group.messages.mediaFile.fileName
                                )}
                            </p>
                        ) : (
                            <p className="text-ellipsis whitespace-nowrap lg:w-[25rem] md:w-[16.5rem] sm:w-[14rem] w-[10rem]">
                                {group.messages.content}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default GroupPreview;
