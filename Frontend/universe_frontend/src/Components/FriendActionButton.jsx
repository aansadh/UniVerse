import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const FriendActionButton = ({ otherUserId, onUnFriend, pstatus, pisRequester }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState(pstatus); // "none", "pending", "accepted"
  const [isRequester, setIsRequester] = useState(pisRequester);
  const [loading, setLoading] = useState(false);

  const sendRequest = async () => {
    try {
      await axios.post("/friends/request", { recipientId: otherUserId });
      toast.success("Friend request sent!");
      setStatus("pending");
      setIsRequester(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  const acceptRequest = async () => {
    try {
      await axios.patch("/friends/accept", { requesterId: otherUserId });
      toast.success("Friend request accepted!");
      setStatus("accepted");
    } catch(error) {
      toast.error("Failed to accept request");
    }
  };

  const handleUnfriend = async () => {
    try {
      await axios.delete('/friends/unfriend', {friendId: otherUserId})
      toast.success('Unfriended!')
      setStatus(null)
      onUnFriend?.(otherUserId)
    } catch(error) {
      toast.error("Failed to unfriend!")
    }
  };

  if (loading) return <Button disabled >Loading...</Button>;

  let buttonText = "Add Friend";
  let onClick = sendRequest;
  let disabled = false;

  if (status === "accepted") {
    buttonText = "Unfriend";    // "UnFriend"
    onClick = handleUnfriend;
  } else if (status === "pending") {
    if (isRequester) {
      buttonText = "Requested";
      disabled = true;
    } else {
      buttonText = "Accept";
      onClick = acceptRequest;
      disabled = false;
    }
  }
  return (
    (status !== 'accepted') && (
      <Button onClick={onClick}
      disabled={disabled}
      variant={status === "accepted" ? "secondary" : "default"}
     >
      {buttonText}
    </Button>)
  );
};

export default FriendActionButton;
