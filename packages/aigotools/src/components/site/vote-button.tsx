"use client";
import { Button } from "@nextui-org/react";
import { ThumbsUpIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import clsx from "clsx";

import { Site } from "@/models/site";
import { isUserUpVoteSite, triggerUpvoteSite } from "@/lib/actions";
import { AppConfig } from "@/lib/config";

export default function VoteButton({ site }: { site: Site }) {
  if (!AppConfig.clerkEnabled) {
    return <PublicVoteButton site={site} />;
  }

  return <AuthenticatedVoteButton site={site} />;
}

function PublicVoteButton({ site }: { site: Site }) {
  const t = useTranslations("site");

  return (
    <Button
      className="w-56 font-semibold"
      color="success"
      radius="sm"
      variant="bordered"
    >
      <ThumbsUpIcon size={14} strokeWidth={3} />
      {t("upvote")}
      {site.voteCount > 0 && <span>{site.voteCount}</span>}
    </Button>
  );
}

function AuthenticatedVoteButton({ site }: { site: Site }) {
  const t = useTranslations("site");
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [voteCount, setVoteCount] = useState(site.voteCount);
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn } = useAuth();

  const triggerUpvote = async () => {
    try {
      if (isLoading) {
        return;
      }
      setIsLoading(true);
      const { count, upvoted } = await triggerUpvoteSite(site._id);

      setIsUpvoted(upvoted);
      setVoteCount(count);
    } catch {
      toast.error(t("voteFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const update = async () => {
      setVoteCount(site.voteCount);
      setIsUpvoted(await isUserUpVoteSite(site._id));
    };

    update().finally(() => {
      setIsLoading(false);
    });
  }, [isSignedIn, site]);

  const button = (
    <Button
      className={clsx("w-56 font-semibold", {
        "!text-primary-50": isUpvoted,
      })}
      color="success"
      isLoading={isLoading}
      radius="sm"
      variant={isUpvoted ? "solid" : "bordered"}
      onClick={isSignedIn ? triggerUpvote : undefined}
    >
      <ThumbsUpIcon size={14} strokeWidth={3} />
      {t("upvote")}
      {voteCount > 0 && <span>{voteCount}</span>}
    </Button>
  );

  return isSignedIn ? (
    button
  ) : (
    <SignInButton
      forceRedirectUrl={
        typeof window !== "undefined" ? window.location.href : undefined
      }
      mode="modal"
    >
      {button}
    </SignInButton>
  );
}
