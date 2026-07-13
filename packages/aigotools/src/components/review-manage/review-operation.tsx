import { Button } from "@nextui-org/react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { Ban, Bone, Check } from "lucide-react";

import { ReviewState } from "@/lib/constants";
import { Review } from "@/models/review";
import { updateReviewState } from "@/lib/actions";

export default function ReviewOperation({
  review,
  handleSearch,
}: {
  review: Review;
  handleSearch: () => void;
}) {
  const t = useTranslations("reviewManage");

  const [updating, setUpdating] = useState(false);

  const handleUpdateReviewState = useCallback(
    async (review: Review, state: ReviewState) => {
      if (updating) {
        return false;
      }

      try {
        setUpdating(true);

        await updateReviewState(review._id, state);

        await handleSearch();
      } catch (error) {
        console.log(error);
        toast.error(t("failUpdate"));
      } finally {
        setUpdating(false);
      }
    },
    [handleSearch, updating, t],
  );

  if (review.state === ReviewState.pending) {
    return (
      <div className="flex items-center gap-2">
        <Button
          color="success"
          isLoading={updating}
          size="sm"
          startContent={!updating && <Check size={14} />}
          variant="flat"
          onPress={() => handleUpdateReviewState(review, ReviewState.approved)}
        >
          {t("approve")}
        </Button>
        <Button
          color="danger"
          isDisabled={updating}
          size="sm"
          startContent={<Ban size={14} />}
          variant="flat"
          onPress={() => handleUpdateReviewState(review, ReviewState.rejected)}
        >
          {t("reject")}
        </Button>
      </div>
    );
  } else if (review.state === ReviewState.rejected) {
    return (
      <Button
        color="secondary"
        isLoading={updating}
        size="sm"
        startContent={!updating && <Bone size={14} />}
        variant="flat"
        onPress={() => handleUpdateReviewState(review, ReviewState.pending)}
      >
        {t("withdraw")}
      </Button>
    );
  }

  return <span className="text-xs text-primary-400">-</span>;
}
