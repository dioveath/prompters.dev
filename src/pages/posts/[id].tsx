import Navbar from "@/not-app/navbar";
import Container from "@/ui/container";
import { GetServerSideProps } from "next";
import React, { useEffect, useMemo, useState } from "react";
import SuperJSON from "superjson";
import Image from "next/image";
import Footer from "@/sections/footer";
import { gql, useMutation, useQuery } from "@apollo/client";
import toast from "react-hot-toast";
import { TbArrowBigUpLines, TbArrowBigUpLinesFilled } from "react-icons/tb";

import { FacebookShareButton, FacebookIcon, InstapaperShareButton, InstapaperIcon, TwitterShareButton, TwitterIcon } from "react-share";
import CommentCard from "@/components/posts/comment";
import { Comment } from "@prisma/client";
import AddComment from "@/components/posts/add_comment";

import SlateView from "@/sections/posts/slateview";

type PostProps = {
  post: string;
};

type CommentExtended = Comment & {
  author: { name: string; avatar: string };
  post: { id: string };
};

const getPostCommentsQuery = gql`
  query($id: ID!) {
    post(id: $id) {
      id
      votesCount
      meVoted
      comments {
        id
        content
        author {
          id
          name
          avatar
        }
        post {
          id
        }
        replies {
          id          
        }
        createdAt
        updatedAt
      }
    }
  }
`;


const updateVoteMutation = gql`
  mutation($id: ID!) {
    updatePostVote(id: $id){
      id
      votesCount
      meVoted
    }
  }
`;

const CommentContext = React.createContext<any>({});
export const useCommentContext = () => React.useContext<any>(CommentContext);
export type { CommentExtended };


export default function Post({ post }: PostProps) {
  const { id, title, content, skills, ais, tools, votesCount: propVoteCount, author } = SuperJSON.parse<any>(post);
  const [updatePost, { data, loading, error }] = useMutation(updateVoteMutation);
  const [formOpen, setFormOpen] = useState<boolean>(false);

  const [rootComments, setRootComments] = useState<CommentExtended[]>([]);
  const [groupComments, setGroupComments] = useState<any>({});
  const { data: queryData, loading: getPostLoading, error: getPostError } = useQuery(getPostCommentsQuery, { variables: { id: id } });
  const { votesCount, meVoted } = queryData?.post || { votesCount: propVoteCount, meVoted: false };

  useEffect(() => {
    if(!queryData) return;

    const mappedComments: any = {};
    const comments = queryData.post.comments;

    comments.forEach((comment: any) => {
      mappedComments[comment.id] = comment;
    });

    const groupComments: any = {};
    let rootComments: any = queryData.post.comments;

    comments.forEach((comment: any) => {
      const replies = comment.replies.map((reply: any) => mappedComments[reply.id]);
      rootComments = rootComments.filter((rootComment: any) => { 
        return replies.filter((reply: any) => reply.id === rootComment.id).length === 0;
      });
      groupComments[comment.id] = [ ...replies ];
    });

    setGroupComments(groupComments);
    setRootComments(rootComments);
  }, [queryData]);

  const onVote = async () => {
    try {
      const updatedPost = await toast.promise(updatePost({ variables: { id: id } }), {
        loading: "Updating Votes 🔃🔃",
        success: "Votes Updated! 🎉",
        error: "Error Updating Votes 😥😥, from promise" + error,
      });
    } catch (error){
      toast.error("Error Updating Votes 😥😥");
    }
  };

  return (
    <Container>
      <Navbar path="post" />
      <div className="flex flex-col items-center min-h-screen py-2">
        <div className="flex flex-col items-center justify-start w-full bg-white p-6 rounded-lg shadow-xl gap-4">
          <div className="w-full flex items-center justify-start gap-2">
            <Image alt={`${author?.name} Profile`} src={author?.avatar}
              className="rounded-full"
              width={"40"}
              height={"40"}
            />
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              <article className="text-sm text-gray-500">{author?.name}</article>
            </div>
          </div>
          <div className="w-full flex justify-start items-center gap-4">
              <div className="flex flex-row gap-2">
                {skills?.map((skill: any) => (
                  <p key={skill.id} className="text-xs text-white bg-purple-500 px-2 py-1 rounded-full">
                    {skill.title}
                  </p>
                ))}
              </div>
              <div className="flex flex-row gap-2">
                {ais?.map((ai: any) => (
                  <p key={ai.id} className="text-xs text-white bg-green-500 px-2 py-1 rounded-full">
                    {ai.title}
                  </p>
                ))}
              </div>
              <div className="flex flex-row gap-2">
                {tools?.map((tool: any) => (
                  <p key={tool.id} className="text-xs text-white bg-blue-500 px-2 py-1 rounded-full">
                    {tool.title}
                  </p>
                ))}
              </div>
          </div>

          <div className="w-full">
            <SlateView content={content}/>
          </div>

          <div className="w-full flex justify-between items-center gap-4">
            <div onClick={onVote} className="flex flex-row items-center gap-2 cursor-pointer">
              { meVoted ? 
              <TbArrowBigUpLinesFilled className="text-2xl text-green-500"/>
              : <TbArrowBigUpLines className="text-2xl hover:text-green-500"/> }
              <p className={"text-sm font-bold " + (meVoted ? "text-green-500" : "text-black")}> {votesCount} </p>
            </div>
            <div>
              <button onClick={(e) => setFormOpen(true)}> Comment </button>
            </div>

            <div className="flex gap-2">
              <FacebookShareButton
                url={`https://charichainstitute.com.np/blog/VMw8hIk37JPMQTEHiKai`}
                quote={title}
                hashtag="#AI"
              >
                <FacebookIcon size={32} round />
              </FacebookShareButton>
              <TwitterShareButton
                url={`https://charichainstitute.com.np/blog/VMw8hIk37JPMQTEHiKai`}
                title={title}
                hashtags={["AI"]}
              >
                <TwitterIcon size={32} round />
              </TwitterShareButton>
              <InstapaperShareButton
                url={`https://charichainstitute.com.np/blog/VMw8hIk37JPMQTEHiKai`}
                title={title}
              >
                <InstapaperIcon size={32} round />
              </InstapaperShareButton>
            </div>
          </div>

          <div className="w-full flex flex-col justify-start">
            <h1 className="text-2xl font-bold my-4">Comments</h1>
            <div className="w-full flex flex-col gap-4">
              <CommentContext.Provider value={{ groupComments }} >
                { formOpen && <AddComment comment={{ postId: id }} setFormOpen={setFormOpen} /> }
                {rootComments?.map((comment: any) => (
                  <CommentCard key={comment.id} comment={comment} />
                ))}
              </CommentContext.Provider>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </Container>
  );
}

function isValid(id: string | undefined) {
  if(!id) return false;
	// simply match the id from regular expression
	if (id.match(/^[0-9a-fA-F]{24}$/)) {
		return true;
	} else {
		return false;
	}
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { params } = context;
  let post: any = undefined;
  
  if(!params?.id) return { notFound: true };


  let id = params?.id?.toString();
  let where: any = { id: id };
  if(isValid(id)) {
    const post = await prisma.post.findUnique({ where: { id: id } });
    if(!post) return { notFound: true };
    if(post.slug) {
      return {
        redirect: {
          destination: `/posts/${post.slug}`,
          permanent: true,        
        }
      }      
    }
  } else {
    where = { slug: id };
  }

  try {
    post = await prisma.post.findUnique({
      where: where,
      include: {
        _count: { select: { votes: true } },
        skills: {
          include: {
            skill: true,
          },
        },
        votes: true,
        ais: {
          include: {
            ai: true,
          },
        },
        tools: {
          include: {
            tool: true,
          }
        },
        comments: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            author: true,
          },
        },
        author: true,
      },
    });

    post.skills = post?.skills.map((skill: any) => skill.skill);
    post.ais = post?.ais.map((ai: any) => ai.ai);
    post.tools = post?.tools.map((tool: any) => tool.tool);
    post.votesCount = post._count.votes;
  } catch (error) {
    console.log(error);
  }

  if (!post)
    return {
      notFound: true,
    };

  return {
    props: {
      post: SuperJSON.stringify(post),
    },
  };
};