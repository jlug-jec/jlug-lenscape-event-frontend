"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipLoader } from 'react-spinners'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useUserStore from '@/store/useUserStore';
import { FaCamera } from 'react-icons/fa';
import "../../app/globals.css";
import { useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export default function OnboardingPage() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const invitedTeamId = searchParams.get('teamId');
  
  const [isInvited, setIsInvited] = useState(false);
  const [invitedTeamName, setInvitedTeamName] = useState('');
  const [branch, setBranch] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [isParticipant, setIsParticipant] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState([{ name: '', email: '', branch: '', collegeName: '',userId: '' }]);
  const [photographyLink, setPhotographyLink] = useState('');
  const [photographyTitle, setPhotographyTitle] = useState('');
  const [videographyLink, setVideographyLink] = useState('');
  const [videographyTitle, setVideographyTitle] = useState('');
  const [digitalArtLink, setDigitalArtLink] = useState('');
  const [digitalArtTitle, setDigitalArtTitle] = useState('');
  const [teamLeaderIndex, setTeamLeaderIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [teamId, setTeamId] = useState(uuidv4());
  const isOnboarded=localStorage.getItem('onboardedUser');
  const isParticipantLocalStorage=localStorage.getItem('isParticipant');
  if(isOnboarded && isParticipantLocalStorage){
    router.push('/profile');
  }

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/participant/users/${userId}`);
        if (response.ok) {
          const result = await response.json();
          const { email, name, picture, isOnboarded, team } = result;
          
          setUser({ name, picture, userId, email });
          setTeamMembers([{ name, email, branch: '', collegeName: '',userId: userId }]);

          if (isOnboarded) {
            router.push('/profile');
            return;
          }

          if (invitedTeamId) {
            const teamResponse = await fetch(`http://localhost:8000/api/participant/team/${invitedTeamId}`);
            if (teamResponse.ok) {
              const teamResult = await teamResponse.json();
              setIsInvited(true);
              setInvitedTeamName(teamResult.teamName);
              setTeamName(teamResult.teamName);
              setTeamMembers(teamResult.teamMembers.map(member => ({
                name: member.name,
                email: member.email,
                branch: member.branch || '',
                collegeName: member.collegeName || ''
              })));
              setTeamId(invitedTeamId);
            }
          }
        } else {
          toast.error("Failed to fetch user details. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    };

    fetchUserDetails();
  }, [userId, invitedTeamId, router, setUser]);

  const handleCheckboxChange = (checked: boolean) => {
    setIsParticipant(checked);
  };

  const handleAddMember = () => {
    if (teamMembers.length >= 5) {
      toast.error("Maximum team members reached.");
      return;
    }
    setTeamMembers([...teamMembers, { name: '', email: '', branch: '', collegeName: '' ,userId: ''}]);
  };

  const handleRemoveMember = (index) => {
    if (index !== 0) {
      const updatedMembers = teamMembers.filter((_, i) => i !== index);
      setTeamMembers(updatedMembers);
    }
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index][field] = value;
    setTeamMembers(updatedMembers);
  };

  const handleNextStep = async () => {
    if (currentStep === 0) {
      if (!branch || !collegeName) {
        toast.error("Branch and College Name are required.");
        return;
      }

      teamMembers[0].branch = branch;
      teamMembers[0].collegeName = collegeName;

      if (!isParticipant) {
        const voterData = {
          email: teamMembers[0].email,
          branch,
          collegeName,
          isParticipant,
        };
        await handleSubmission(voterData);
      } else {
        setCurrentStep(1);
      }
    } else {
      if (!validateSubmission()) {
        return;
      }

      const participantData = {
        teamId,
        teamName,
        teamMembers,
        teamLeader: teamMembers[teamLeaderIndex],
        posts: [
          { type: 'photography', link: photographyLink, title: photographyTitle },
          { type: 'videography', link: videographyLink, title: videographyTitle },
          { type: 'digitalArt', link: digitalArtLink, title: digitalArtTitle }
        ].filter(post => post.link && post.title)
      };
      await handleSubmission(participantData);
    }
  };

  const handleSubmission = async (data) => {
    try {
      const endpoint = isInvited 
        ? 'http://localhost:8000/api/participant/join-team'
        : 'http://localhost:8000/api/participant/onboarding';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        localStorage.setItem('onboardedUser', JSON.stringify(true));
        toast.success("Submission successful!");
        if(data.isParticipant){
          localStorage.setItem('isParticipant', JSON.stringify(false));
          router.push('/countdown');

        }
        else{
          router.push('/profile');
        }
       
      } else {
        toast.error("Failed to submit. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const validateSubmission = () => {
    const memberEmails = teamMembers.map(member => member.email.toLowerCase());
    const uniqueEmails = new Set(memberEmails);

    if (uniqueEmails.size !== memberEmails.length) {
      toast.error("All team members must have unique email addresses.");
      return false;
    }

    if (!photographyLink && !videographyLink && !digitalArtLink) {
      toast.error("At least one link (Photography, Videography, or Digital Art) must be provided.");
      return false;
    }

    if ((photographyLink && !photographyTitle) || (videographyLink && !videographyTitle) || (digitalArtLink && !digitalArtTitle)) {
      toast.error("Each provided link must have a corresponding post title.");
      return false;
    }

    return true;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="backdrop-blur-md bg-gray-800/50 shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white flex items-center justify-center">
              <FaCamera className="mr-2" /> Lenscape
            </CardTitle>
            <CardDescription className="text-xl font-semibold text-gray-300 mt-4">
              {isInvited 
                ? `Welcome ${teamMembers[0]?.name.trim().split(" ")[0]}! You've been invited to join ${invitedTeamName}.`
                : `Hello ${teamMembers[0]?.name.trim().split(" ")[0]}! Let's complete your profile.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 0 && (
              <div>
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  value={teamMembers[0]?.email}
                  disabled
                  className="bg-gray-700 text-white border-gray-600"
                  required
                />
                <Label htmlFor="branch" className="text-white mt-4">Branch</Label>
                <Input
                  id="branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="bg-gray-700 text-white border-gray-600"
                  required
                />
                <Label htmlFor="collegeName" className="text-white mt-4">College Name</Label>
                <Input
                  id="collegeName"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="bg-gray-700 text-white border-gray-600"
                  required
                />
                {!isInvited && (
                  <div className="flex items-center mt-4">
                    <Checkbox
                      id="isParticipant"
                      checked={isParticipant}
                      onCheckedChange={(value) => handleCheckboxChange(!!value)}
                    />
                    <Label htmlFor="isParticipant" className="ml-2 text-white">Are you a participant?</Label>
                  </div>
                )}
              </div>
            )}
            {currentStep === 1 && (
              <div>
                <Label htmlFor="teamName" className="text-white">Team Name</Label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="bg-gray-700 text-white border-gray-600"
                  required
                  disabled={isInvited}
                />
                <Label className="text-white mt-4">Team Members</Label>
                {teamMembers.map((member, index) => (
                  <div key={index} className="flex items-center mt-2">
                    <Input
                      value={member.name}
                      onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                      placeholder="Member Name"
                      className="bg-gray-700 text-white border-gray-600 mr-2"
                      disabled={isInvited || index === 0}
                    />
                    <Input
                      value={member.email}
                      onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                      placeholder="Member Email"
                      className="bg-gray-700 text-white border-gray-600 mr-2"
                      disabled={isInvited || index === 0}
                    />
                    {!isInvited && index > 0 && (
                      <Button onClick={() => handleRemoveMember(index)} variant="destructive" className="ml-2">
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                {!isInvited && (
                  <Button onClick={handleAddMember} className="mt-4">Add Team Member</Button>
                )}
                <div className='mt-4 mb-4 gap-3'>
                  <Label className="text-white mt-4">Team Leader</Label>
                  <select
                    value={teamLeaderIndex}
                    onChange={(e) => setTeamLeaderIndex(Number(e.target.value))}
                    className="bg-gray-700 ml-5 text-white border-gray-600 mt-2 rounded-md"
                    disabled={true}
                  >
                    <option value={0}>{teamMembers[0]?.name.trim()}</option>
                    {/* {teamMembers.map((_, index) => (
                      <option key={index} value={index}>{teamMembers[0]?.name.trim()}</option>
                    ))} */}
                  </select>
                </div>
                <Label className="text-white mt-4">Photography</Label>
                <Input
                  value={photographyLink}
                  onChange={(e) => setPhotographyLink(e.target.value)}
                  placeholder="Photography Link"
                  className="bg-gray-700 text-white border-gray-600 mt-2"
                />
                <Input
                  value={photographyTitle}
                  onChange={(e) => setPhotographyTitle(e.target.value)}
                  placeholder="Photography Post Title"
                  className="bg-gray-700 text-white border-gray-600 mt-2"
                />
                <Label className="text-white mt-4">Videography</Label>
                <Input
                  value={videographyLink}
                  onChange={(e) => setVideographyLink(e.target.value)}
                  placeholder="Videography Link"
                  className="bg-gray-700 text-white border-gray-600 mt-2"
                />
                <Input
                  value={videographyTitle}
                  onChange={(e) => setVideographyTitle(e.target.value)}
                  placeholder="Videography Post Title"
                  className="bg-gray-700 text-white border-gray-600 mt-2"
                />
                <Label className="text-white mt-4">Digital Art</Label>
                <Input
                  value={digitalArtLink}
                  onChange={(e) => setDigitalArtLink(e.target.value)}
                  placeholder="Digital Art Link"
                  className="bg-gray-700 text-white border-gray-600 mt-2"
                />
                <Input
                  value={digitalArtTitle}
                  onChange={(e) => setDigitalArtTitle(e.target.value)}
                  placeholder="Digital Art Post Title"
                  className="bg-gray-700 text-white border-gray-600 mt-2"
                />
                <p className="text-sm text-gray-400 mt-4">Note: Post titles and links can be edited until the voting day.</p>
              </div>
            )}
          </CardContent>
          <div className="flex justify-between px-4 pb-4">
            <Button  onClick={() => currentStep === 0 ? router.push('/') : setCurrentStep(0)}>
              {currentStep === 0 ? "Cancel" : "Back"}
            </Button>
            <Button onClick={handleNextStep} disabled={isLoading}>
              {currentStep === 0 ? (isInvited ? "Join Team" : "Next") : "Submit"}
            </Button>
          </div>
        </Card>
      </motion.div>
      <ToastContainer />
    </div>
  );
}