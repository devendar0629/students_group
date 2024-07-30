"use client";

import { Separator } from "@/components/ui/separator";
import { type TGroup } from "@/models/group.model";
import GroupPreview from "./GroupPreview";
import { nunito } from "@/app/ui/fonts";
import { useRouter } from "next/navigation";

interface GroupsPreviewProps {
    groups: TGroup[] | null | undefined;
}

const GroupsPreview: React.FC<GroupsPreviewProps> = function ({ groups }) {
    if (!groups) {
        return <p>Loading ...</p>; // TODO: Create a skeleton screen
    }

    if (groups.length === 0) {
        return <p>No groups created yet</p>;
    }

    const router = useRouter();

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
                    return <GroupPreview group={groupObj} />;
                })}
            </section>
        </>
    );
};

export default GroupsPreview;
