import { client } from '@/lib/prisma'
// import { clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    req: NextRequest,
    context: { params: { id: string } }
) {
    console.log('Enpoint hit ✅')

    const { id } = context.params;

    try {
        const userProfile = await client.user.findUnique({
            where: {
                clerkid: id,
            },
            include: {
                studio: true,
                subscription: {
                    select: {
                        plan: true,
                    },
                },
            },
        })
        if (userProfile)
            return NextResponse.json({ status: 200, user: userProfile })


        // We will not handle the user create part on the electron side, electron user can only login if they have account on webapp.

        // const clerkUserInstance = await clerkClient.users.getUser(id)
        // const createUser = await client.user.create({
        //     data: {
        //         clerkid: id,
        //         email: clerkUserInstance.emailAddresses[0].emailAddress,
        //         firstname: clerkUserInstance.firstName,
        //         lastname: clerkUserInstance.lastName,
        //         studio: {
        //             create: {},
        //         },
        //         workspace: {
        //             create: {
        //                 name: `${clerkUserInstance.firstName}'s Workspace`,
        //                 type: 'PERSONAL',
        //             },
        //         },
        //         subscription: {
        //             create: {},
        //         },
        //     },
        //     include: {
        //         subscription: {
        //             select: {
        //                 plan: true,
        //             },
        //         },
        //     },
        // })

        // if (createUser) return NextResponse.json({ status: 201, user: createUser })

        return NextResponse.json({ status: 400 })
    } catch (error) {
        console.log('ERROR', error)
    }
}