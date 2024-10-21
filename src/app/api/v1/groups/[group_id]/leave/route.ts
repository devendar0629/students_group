import { connectDB } from "@/lib/db.config";
import Group, { GroupMember } from "@/models/group.model";
import Media from "@/models/media.model";
import Message from "@/models/message.model";
import User from "@/models/user.model";
import { getIdFromRequest } from "@/utils/getIdFromRequest";
import { isValidObjectId, Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: {
        group_id: string;
    };
}

/**
 *
 *
 * @description Removes the logged in user
 * @description Deletes the group, if there are no members left
 */
export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
    await connectDB();
    try {
        const groupId = params.group_id;

        if (!isValidObjectId(groupId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Invalid group id",
                    },
                },
                { status: 400 }
            );
        }

        let currUserId = await getIdFromRequest(request);
        const currUserObjectId = new Types.ObjectId(currUserId!);

        const groupAggregation = await Group.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(groupId),
                },
            },
            {
                $lookup: {
                    from: "groupmembers",
                    localField: "members",
                    foreignField: "_id",
                    as: "members",
                },
            },
            {
                $lookup: {
                    from: "groupmembers",
                    localField: "admin",
                    foreignField: "_id",
                    as: "admin",
                },
            },
            {
                $lookup: {
                    from: "messages",
                    localField: "messages",
                    foreignField: "_id",
                    as: "messages",
                    pipeline: [
                        {
                            $lookup: {
                                from: "media",
                                localField: "mediaFile",
                                foreignField: "_id",
                                as: "mediaFile",
                            },
                        },
                        {
                            $unwind: {
                                path: "$mediaFile",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                    ],
                },
            },
            {
                $addFields: {
                    currUser: {
                        $filter: {
                            input: "$members",
                            as: "member",
                            cond: {
                                $eq: ["$$member.userId", currUserObjectId],
                            },
                            limit: 1,
                        },
                    },
                },
            },
            {
                $unwind: {
                    path: "$currUser",
                },
            },
            {
                $addFields: {
                    isCurrUserAdmin: {
                        $in: ["$currUser._id", "$admin._id"],
                    },
                    isCurrUserCreator: {
                        $eq: ["$currUser._id", "$createdBy"],
                    },
                    isCurrUserMember: {
                        $in: ["$currUser._id", "$members._id"],
                    },
                    adminCount: {
                        $size: "$admin",
                    },
                    memberCount: {
                        $size: "$members",
                    },
                },
            },
        ]).then((res) => res[0]);

        if (!groupAggregation) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: "Group not found",
                    },
                },
                { status: 404 }
            );
        }

        // Verify the leaving user is inside the group
        if (!groupAggregation.isCurrUserMember || !groupAggregation?.currUser) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        cause: "Not a group member",
                        message: "Permission denied",
                    },
                },
                { status: 400 }
            );
        }

        const currUserRoleInGroup = groupAggregation.isCurrUserCreator
            ? "CREATOR"
            : groupAggregation.isCurrUserAdmin
            ? "ADMIN"
            : "MEMBER";

        if (currUserRoleInGroup === "CREATOR") {
            // Atleast one admin is there except creator
            if (groupAggregation.adminCount > 1) {
                const oldestAdminAggregation = await Group.aggregate([
                    {
                        $match: {
                            _id: groupAggregation._id,
                        },
                    },
                    {
                        $lookup: {
                            from: "groupmembers",
                            localField: "admin",
                            foreignField: "_id",
                            as: "admin",
                            pipeline: [
                                {
                                    $project: {
                                        joinedAt: "$createdAt",
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $project: {
                            sortedAdmin: {
                                $sortArray: {
                                    input: "$admin",
                                    sortBy: {
                                        joinedAt: 1,
                                    },
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            oldestAdmin: {
                                $arrayElemAt: ["$sortedAdmin", 1],
                            },
                        },
                    },
                ]).then((res) => res[0]);

                // The group member id of the oldest admin
                const oldestAdminGroupMemberId =
                    oldestAdminAggregation.oldestAdmin._id;
                const currUserGroupMemberId = groupAggregation.currUser._id;

                await Promise.all([
                    Group.findByIdAndUpdate(groupAggregation._id, {
                        $pull: {
                            admin: currUserGroupMemberId,
                            members: currUserGroupMemberId,
                        },
                        $set: {
                            createdBy: oldestAdminGroupMemberId,
                        },
                    }),
                    User.findByIdAndUpdate(currUserId, {
                        $pull: {
                            joinedGroups: groupAggregation._id,
                        },
                    }),
                    GroupMember.findByIdAndDelete(currUserGroupMemberId),
                ]);
            }
            // Atleast one member is there except creator
            else if (groupAggregation.memberCount > 1) {
                const oldestMemberAggregation = await Group.aggregate([
                    {
                        $match: {
                            _id: groupAggregation._id,
                        },
                    },
                    {
                        $lookup: {
                            from: "groupmembers",
                            localField: "members",
                            foreignField: "_id",
                            as: "members",
                            pipeline: [
                                {
                                    $project: {
                                        joinedAt: "$createdAt",
                                        userId: "$userId",
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $project: {
                            sortedMembers: {
                                $sortArray: {
                                    input: "$members",
                                    sortBy: {
                                        joinedAt: 1,
                                    },
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            oldestMember: {
                                $arrayElemAt: ["$sortedMembers", 1],
                            },
                        },
                    },
                ]).then((res) => res[0]);

                // The group member id of the oldest member
                const oldestMemberGroupMemberId =
                    oldestMemberAggregation.oldestMember._id;
                const currUserGroupMemberId = groupAggregation.currUser._id;

                await Promise.all([
                    Group.findByIdAndUpdate(groupAggregation._id, {
                        $pull: {
                            admin: currUserGroupMemberId,
                            members: currUserGroupMemberId,
                        },
                    }),
                    User.findByIdAndUpdate(currUserId, {
                        $pull: {
                            joinedGroups: groupAggregation._id,
                        },
                    }),
                    GroupMember.findByIdAndDelete(currUserGroupMemberId),
                ]).then(() =>
                    // This is in then chain , because both $push and $pull in the same admin array clashes
                    Group.findByIdAndUpdate(groupId, {
                        $push: {
                            admin: oldestMemberGroupMemberId,
                        },
                        $set: {
                            createdBy: oldestMemberGroupMemberId,
                        },
                    })
                );
            }
            // No members are there. Leave and delete the group, messages, media, ..etc
            else {
                // Delete all media files
                await Promise.all(
                    groupAggregation.messages
                        .filter((message: any) => message.mediaFile)
                        .map((message: any) =>
                            Media.findByIdAndDelete(message.mediaFile._id)
                        )
                );

                // Delete all messages
                await Promise.all(
                    groupAggregation.messages.map((message: any) =>
                        Message.findByIdAndDelete(message._id)
                    )
                );

                await Promise.all([
                    GroupMember.findByIdAndDelete(
                        groupAggregation.currUser._id
                    ),
                    User.findByIdAndUpdate(currUserId, {
                        $pull: {
                            joinedGroups: groupAggregation._id,
                        },
                    }),
                ]);

                await Group.findByIdAndDelete(groupAggregation._id);
            }
        } else if (currUserRoleInGroup === "ADMIN") {
            const currUserGroupMemberId = groupAggregation.currUser._id;

            await Promise.all([
                Group.findByIdAndUpdate(groupId, {
                    $pull: {
                        admin: currUserGroupMemberId,
                        members: currUserGroupMemberId,
                    },
                }),
                User.findByIdAndUpdate(currUserId, {
                    $pull: {
                        joinedGroups: groupAggregation._id,
                    },
                }),
                GroupMember.findByIdAndDelete(currUserGroupMemberId),
            ]);
        } else if (currUserRoleInGroup === "MEMBER") {
            const currUserGroupMemberId = groupAggregation.currUser._id;

            await Promise.all([
                Group.findByIdAndUpdate(groupId, {
                    $pull: {
                        members: currUserGroupMemberId,
                    },
                }),
                User.findByIdAndUpdate(currUserId, {
                    $pull: {
                        joinedGroups: groupAggregation._id,
                    },
                }),
                GroupMember.findByIdAndDelete(currUserGroupMemberId),
            ]);
        }

        return NextResponse.json(
            {
                success: true,
                message: "Group left successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.log("GROUP LEAVE ERROR: ", error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: "Something went wrong while leaving the group",
                },
            },
            { status: 500 }
        );
    }
}
