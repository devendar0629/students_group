"use client";

import { Separator } from "@/components/ui/separator";
import { type TGroup } from "@/models/group.model";
import GroupPreview from "./GroupPreview";
import { nunito } from "@/app/ui/fonts";
import { Loader2Icon } from "lucide-react";

interface GroupsPreviewProps {
    groups: (TGroup & { _id: string })[] | null | undefined;
}

const GroupsPreview: React.FC<GroupsPreviewProps> = function ({ groups }) {
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

    return (
        <>
            <section className="h-full w-full rounded-sm bg-gray-900">
                <p
                    className={`text-[1.55rem] w-full font-semibold rounded-t-sm pt-3 pb-3.5 ${nunito.className}`}
                >
                    <span className="pl-3.5">Groups</span>
                </p>
                <Separator orientation="horizontal" className="mb-3.5" />

                {groups.map((groupObj) => {
                    return <GroupPreview key={groupObj._id} group={groupObj} />;
                })}
            </section>
        </>
    );
};

export default GroupsPreview;
