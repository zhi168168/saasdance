"use client";

import { Button, Chip } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { ProcessStage, ReviewState, SiteState } from "@/lib/constants";

const localReviewsKey = "saasDanceLocalReviews";
const localSitesKey = "saasDanceLocalSites";

function getLocalItems<T>(key: string): T[] {
  try {
    return JSON.parse(window.localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function saveLocalItems<T>(key: string, items: T[]) {
  window.localStorage.setItem(key, JSON.stringify(items));
}

function formatTime(value: number) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default function LocalReviewTable() {
  const [reviews, setReviews] = useState<any[]>([]);

  const load = () => {
    setReviews(getLocalItems(localReviewsKey));
  };

  useEffect(() => {
    load();
  }, []);

  const updateReview = (reviewId: string, state: ReviewState) => {
    const now = Date.now();
    const nextReviews = getLocalItems<any>(localReviewsKey).map((review) =>
      review._id === reviewId ? { ...review, state, updatedAt: now } : review
    );
    const nextSites = getLocalItems<any>(localSitesKey).map((site) =>
      site._id === reviewId.replace("review", "site")
        ? {
            ...site,
            state:
              state === ReviewState.approved
                ? SiteState.published
                : SiteState.unpublished,
            processStage: ProcessStage.success,
            updatedAt: now,
          }
        : site
    );

    saveLocalItems(localReviewsKey, nextReviews);
    saveLocalItems(localSitesKey, nextSites);
    load();
    toast.success(
      state === ReviewState.approved
        ? "Tool approved. It will now appear on the homepage."
        : "Tool rejected."
    );
  };

  if (!reviews.length) {
    return (
      <div className="mt-8 rounded-lg border border-primary-200 p-12 text-center text-primary-400">
        No submitted tools yet.
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-primary-200">
      <table className="min-w-[1180px] w-full text-left text-sm">
        <thead className="bg-primary-100 text-primary-500">
          <tr>
            <th className="p-3">Submitted</th>
            <th className="p-3">Logo</th>
            <th className="p-3">App Image</th>
            <th className="p-3">Tool</th>
            <th className="p-3">Tagline</th>
            <th className="p-3">URL</th>
            <th className="p-3">Category</th>
            <th className="p-3">Status</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review._id} className="border-t border-primary-200">
              <td className="p-3 text-primary-500">
                {formatTime(review.createdAt)}
              </td>
              <td className="p-3">
                {review.logo ? (
                  <img
                    alt={`${review.name} logo`}
                    className="h-10 w-10 rounded-md object-contain"
                    src={review.logo}
                  />
                ) : (
                  <span className="text-primary-300">-</span>
                )}
              </td>
              <td className="p-3">
                {review.appImage ? (
                  <img
                    alt={`${review.name} app screenshot`}
                    className="h-16 w-28 rounded-md object-cover"
                    src={review.appImage}
                  />
                ) : (
                  <span className="text-primary-300">-</span>
                )}
              </td>
              <td className="p-3 font-semibold">{review.name}</td>
              <td className="max-w-[260px] p-3 text-primary-500">
                <span className="line-clamp-3">{review.tagline || "-"}</span>
              </td>
              <td className="p-3">
                <a className="text-blue-500 hover:underline" href={review.url} target="_blank">
                  {review.url}
                </a>
              </td>
              <td className="p-3">{review.category}</td>
              <td className="p-3">
                <Chip size="sm" variant="flat">
                  {review.state}
                </Chip>
              </td>
              <td className="p-3">
                <div className="flex gap-2">
                  {review.state !== ReviewState.approved && (
                    <Button
                      color="success"
                      size="sm"
                      onPress={() =>
                        updateReview(review._id, ReviewState.approved)
                      }
                    >
                      Approve
                    </Button>
                  )}
                  {review.state !== ReviewState.rejected && (
                    <Button
                      color="danger"
                      size="sm"
                      variant="flat"
                      onPress={() =>
                        updateReview(review._id, ReviewState.rejected)
                      }
                    >
                      Reject
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
