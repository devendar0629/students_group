"use client";

interface GroupPreviewProps {
    group: any;
}

const GroupPreview: React.FC<GroupPreviewProps> = function ({ group }) {
    if (!group) {
        return <>Empty</>;
    }

    // No group messages
    if (!group.messages || (group.messages && group.messages.length === 0)) {
        return (
            <>
                <div
                    className={`w-full h-16 bg-gray-700 flex flex-col flex-nowrap justify-center pl-3 gap-0.5`}
                >
                    <p className="font-semibold pl-px">{group.name}</p>
                    <div className="text-[.925rem]">No messages yet.</div>
                </div>
            </>
        );
    }

    return (
        <>
            <div
                className={`w-full h-16 bg-gray-700 flex flex-col flex-nowrap justify-center pl-3 gap-0.5`}
            >
                <p className="font-semibold pl-px">{group.name}</p>
                <div>
                    <div>
                        <span>~{group.messages.sender.name}: </span>
                        {group.messages.mediaFile ? (
                            <span>{group.messages.mediaFile.fileName}</span>
                        ) : (
                            <span>{group.messages.content}</span>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default GroupPreview;
