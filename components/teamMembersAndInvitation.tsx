"use client"
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import useUserStore from "@/store/useUserStore";
import { toast } from "react-toastify";
import Image from "next/legacy/image";
import { TeamMember } from "@/app/types/user";

export default function TeamMembersAndInvitation({ teamMembers,pendingInvitations }: { teamMembers: TeamMember[],pendingInvitations: (string | null)[] }) {

  const [isTooltipOpen, setIsTooltipOpen] = useState<string | null>(null)

  const truncateEmail = (email: string) => {
    const [username, domain] = email.split('@')
    return `${username.slice(0, 6)}...@${domain}`
  }

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
            <TooltipProvider key={index}>
              <Tooltip open={isTooltipOpen === email} onOpenChange={(open) => setIsTooltipOpen(open ? email : null)}>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2 bg-yellow-600 p-2 rounded-md cursor-pointer">
                    <span className="text-xs text-yellow-200">Pending:</span>
                    <span className="text-sm text-white">{email && truncateEmail(email)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{email}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
          ))}
          
        </div>
      </CardContent>
    </Card>
  )
}