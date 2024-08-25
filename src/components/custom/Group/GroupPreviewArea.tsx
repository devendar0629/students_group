"use client";

import { Separator } from "@/components/ui/separator";
import { type TGroup } from "@/models/group.model";
import GroupPreview from "./GroupPreview";
import { nunito } from "@/app/ui/fonts";
import { Loader2Icon } from "lucide-react";

import NewGroupCreatePopup from "./NewGroupCreatePopup";

interface GroupsPreviewProps {
    groups: (TGroup & { _id: string })[] | null | undefined;
    onSelectedGroupChange: React.Dispatch<React.SetStateAction<any>>;
}

const GroupsPreview: React.FC<GroupsPreviewProps> = function ({
    groups,
    onSelectedGroupChange,
}) {
    if (!groups) {
        return (
            <section className="w-full h-full flex justify-center items-center">
                <p className="text-lg font-semibold flex justify-center items-center gap-2">
                    <Loader2Icon className="animate-spin" /> Loading
                </p>
            </section>
        );
    }

    if (groups.length === 0) {
        return <p>No groups created yet</p>;
    }

    const handleGroupChange = (e: any) => {
        if (e.target.parentNode?.classList.contains("group-preview-unit")) {
            onSelectedGroupChange(e.target.parentNode);
        }
    };

    return (
        <>
            <section className="h-full w-full rounded-sm bg-gray-900">
                <div
                    className={`flex flex-row flex-nowrap items-center text-[1.85rem] w-full justify-between pt-3 pb-3.5 ${nunito.className}`}
                >
                    <span className="pl-3.5 font-semibold">Groups</span>

                    <NewGroupCreatePopup />
                </div>
                <Separator orientation="horizontal" className="mb-3.5" />

                <div className="w-full" onClick={handleGroupChange}>
                    {groups.map((groupObj, currGroupNumber) => {
                        return (
                            <>
                                <GroupPreview
                                    className={`cursor-pointer group-preview-unit gp-no-${currGroupNumber}`}
                                    key={groupObj._id}
                                    group={groupObj}
                                />
                                {currGroupNumber < groups.length - 1 && (
                                    <Separator
                                        key={currGroupNumber}
                                        orientation="horizontal"
                                        className="bg-black"
                                    />
                                )}
                            </>
                        );
                    })}
                </div>
            </section>
        </>
    );
};

export default GroupsPreview;
