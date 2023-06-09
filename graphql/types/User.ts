import { PrismaFieldResolver } from "@pothos/plugin-prisma";
import PrismaTypes from "@pothos/plugin-prisma/generated";
import { builder } from "../builder";
import prisma from "../../lib/prisma";

builder.prismaObject('User', {
    fields: (t) => ({
        id: t.exposeID('id'),
        email: t.exposeString('email'),
        name: t.exposeString('name', { nullable: true }),
        username: t.exposeString('username', { nullable: true }),
        avatar: t.exposeString('avatar', { nullable: true }),
        jobTitle: t.exposeString('jobTitle', { nullable: true }),
        posts: t.relation('posts', { type: 'Post' as any }),
        authoredTools: t.relation('authoredTools', { type: 'AuthorsOnTools' as any }),
        createdAt: t.string({ resolve: (root) => root.createdAt.getTime().toString() }),
        updatedAt: t.string({ resolve: (root) => root.updatedAt.getTime().toString() }),
    })
});


builder.queryField('users', (t) => 
    t.prismaField({
        type: ['User'],
        resolve: async (query, _parent, _args, _ctx, _info) => {
            const users = await prisma.user.findMany({ ...query });
            return users;
        }
    })
);

builder.mutationField('updateMe', (t) => 
    t.prismaField({
        type: 'User',
        args: {
            name: t.arg.string({ required: false }),
            username: t.arg.string({ required: false }),
            avatar: t.arg.string({ required: false }),
            jobTitle: t.arg.string({ required: false }),
        },
        resolve: async (_query, _parent, args, _ctx, _info) => {
            const { user } = await _ctx;
            if (!user) throw new Error('Youre not logged in');

            const dbUser = await prisma.user.findUnique({
                where: { email: user.email },
            });
            if (!dbUser) throw new Error('Youre not logged in');

            const { id } = dbUser;
            const { name, username, avatar, jobTitle } = args;
            
            const updatedMe = await prisma.user.update({
                where: { id },
                data: {
                    name: name || user.name,
                    username: username || user.username,
                    avatar: avatar || user.avatar,
                    jobTitle: jobTitle || user.jobTitle,
                }
            });
            return updatedMe;
        }
    })
);
