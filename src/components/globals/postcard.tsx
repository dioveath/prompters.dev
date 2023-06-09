import { gql, useMutation, useQuery } from "@apollo/client";
import Link from "next/link";
import React, { useMemo } from "react";
import { toast } from "react-hot-toast";
import { TbArrowBigUpLines, TbArrowBigUpLinesFilled } from "react-icons/tb";
import { SlBadge } from "react-icons/sl";
import { GiRobotHelmet } from "react-icons/gi";
import { BsTools } from "react-icons/bs";
import { Card, Container, Typography, Chip, Box } from "@mui/material";
import { useUser } from "@auth0/nextjs-auth0/client";

const updateVoteMutation = gql`
  mutation ($id: ID!) {
    updatePostVote(id: $id) {
      id
      title
      votesCount
      meVoted
    }
  }
`;

type PostCardProps = {
  id: number;
  title: string;
  content: string;
  votesCount: number;
  meVoted: boolean;
  skills: [];
  ais: [];
  tools: [];
};

export default function PostCard(props: PostCardProps) {
  const { id, title, content, votesCount, meVoted, skills, ais, tools } = props;
  const [updatePost, { data, loading, error }] = useMutation(updateVoteMutation);
  const { user, isLoading: userLoading, error: userError } = useUser();

  const summary = useMemo(() => {
    const parsedContent = JSON.parse(content);
    let summary = "";
    parsedContent.forEach((node: any) => {
      if (node.type === "paragraph") {
        summary += " " + node.children[0].text;
      }
    });
    return summary.length >= 148 ? summary.substring(0, 148) + "..." : summary;
  }, [content]);

  const onVote = () => {
    if (!user) return toast.error("Please login to vote");
    try {
      toast.promise(updatePost({ variables: { id: id } }), {
        loading: "Updating Votes 🔃🔃",
        success: "Votes Updated! 🎉",
        error: "Error Updating Votes 😥😥, from promise" + error,
      });
    } catch (error) {
      toast.error("Error Updating Votes 😥😥");
    }
  };

  return (
    <div className="w-full flex justify-between cursor-pointer shadow-md shadow-gray-900 rounded-lg overflow-clip">
      <Box className="flex flex-col items-center px-0 py-4 lg:px-6">
        <div onClick={onVote} className="flex flex-col items-center gap-1">
          {meVoted ? <TbArrowBigUpLinesFilled className="text-2xl text-green-500" /> : <TbArrowBigUpLines className="text-2xl hover:text-green-500" />}
          <Typography variant="body2"> {votesCount} </Typography>
        </div>
      </Box>
      <Link href={`posts/${id}`} className="flex-1 py-2 px-2 md:px-4 no-underline text-inherit">
        <Typography variant="h6" className="font-semibold mb-1">
          {" "}
          {title}{" "}
        </Typography>
        <Typography variant="body2">
          {" "}
          {summary}{" "}
        </Typography>
        <div className="flex gap-4 flex-wrap">
          <div>
            <Typography variant="body2" className="font-semibold mb-1">
              {" "}
              Tools{" "}
            </Typography>
            <ul className="flex gap-2">
              {tools.map((tool: any) => (
                <Chip key={tool.id} label={tool.title} icon={<BsTools />} color="primary" className="px-2" size="small" />
              ))}
            </ul>
          </div>

          <div>
            <Typography variant="body2" className="font-semibold mb-1">
              {" "}
              Skills{" "}
            </Typography>
            <ul className="flex gap-2">
              {skills.map((skill: any) => (
                <Chip key={skill.id} label={skill.title} icon={<SlBadge />} color="primary" className="px-2" size="small" />
              ))}
            </ul>
          </div>

          <div>
            <Typography variant="body2" className="font-semibold mb-1">
              {" "}
              AI{" "}
            </Typography>
            <ul className="flex gap-2">
              {ais.map((ai: any) => (
                <Chip key={ai.id} label={ai.title} icon={<GiRobotHelmet />} color="primary" className="px-2" size="small" />
              ))}
            </ul>
          </div>
        </div>
      </Link>
    </div>
  );
}
