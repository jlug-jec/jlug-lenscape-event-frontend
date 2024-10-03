"use client"
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useUserStore from "@/store/useUserStore";
import { toast } from "react-toastify";
import Image from "next/legacy/image";

interface TeamMember {
  _id: string;
  name: string;
  picture: string;
}

interface UserData {
  team?: {
    _id: string;
  };
  // Add other user properties as needed
}

export default function TeamMembersAndInvitation() {
  const { user } = useUserStore();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user?.userId) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/participant/users/${user.userId}`);
        if (response.ok) {
          const result = await response.json();
          setUserData(result);
        } else {
          toast.error("Failed to fetch user details. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    };

    fetchUserDetails();
  }, [user?.userId]);

  useEffect(() => {
    const fetchTeamDetailsAndInvitations = async () => {
      if (!userData?.team?._id) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/participant/invitations/${userData.team._id}`);
        if (response.ok) {
          const data = await response.json();
          console.log(data)
          setTeamMembers(data.teamMembers);
          setPendingInvitations(data.invitations);
        } else {
          toast.error("Failed to fetch team details and invitations.");
        }
      } catch (error) {
        console.error("Error fetching team details and invitations:", error);
        toast.error("An unexpected error occurred while fetching data.");
      }
    };

    if (userData?.team?._id) {
      fetchTeamDetailsAndInvitations();
    }
  }, [userData]);

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-neutral-500">Team Members & Pending Invitations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Display Team Members */}
          {teamMembers.map((member) => (
            <div key={member._id} className="flex items-center space-x-2 bg-gray-700 p-2 rounded-md">
              <Image src={member.picture} alt={member.name} width={40} height={40} className="rounded-full" />
              <span className="text-neutral-300">{member.name}</span>
            </div>
          ))}
          {/* Display Pending Invitations */}
          {pendingInvitations.map((email, index) => (
            <div key={index} className="flex items-center space-x-2 bg-yellow-600 p-2 rounded-md">
              <span>Pending Invitation to:</span>
              <span>{email}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}