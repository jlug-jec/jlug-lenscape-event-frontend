"use client"
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { BarLoader, CircleLoader } from 'react-spinners'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useUserStore from '@/store/useUserStore';
import { FaCamera } from 'react-icons/fa';
import "../../app/globals.css";
import { useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import local from 'next/font/local';

interface TeamMember {
  name: string;
  email: string;
  branch: string;
  collegeName: string;
  userId: string | null; // Can change this to string | null if userId can be null
}
export default function OnboardingPage() {
  const router = useRouter();
  const { user,setUser,loadUser } = useUserStore();
  const searchParams = useSearchParams();
  const invitedTeamId = searchParams.get('teamId');
  
  const [isInvited, setIsInvited] = useState(false);
  const [invitedTeamName, setInvitedTeamName] = useState('');
  const [branch, setBranch] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [isParticipant, setIsParticipant] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([ { name: '', email: '', branch: '', collegeName: '', userId: '' }] as any[]);


interface TeamMember {
  name: string;
  email: string;
  branch: string;
  collegeName: string;
  userId: string | null | undefined;
  [key: string]: any;
}

  const [photographyLink, setPhotographyLink] = useState('');
  const [photographyTitle, setPhotographyTitle] = useState('');
  const [photoType, setPhotoType] = useState('image');
  const [videographyLink, setVideographyLink] = useState('');
  const [videographyTitle, setVideographyTitle] = useState('');
  const [videoType, setVideoType] = useState('');
  const [digitalArtLink, setDigitalArtLink] = useState('');
  const [digitalArtTitle, setDigitalArtTitle] = useState('');
  const [digitalArtType, setDigitalArtType] = useState(null);
  const [teamLeaderIndex, setTeamLeaderIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [teamId, setTeamId] = useState(uuidv4());
  const [isDriveChecking,setIsDriveChecking]=useState(false);
  let userId:string | null 
  useEffect(() => {
    const initializeUser = async () => {
      const isOnboarded = localStorage.getItem('onboardedUser') === 'true';
      const isParticipantStatus = localStorage.getItem('isParticipant') === 'true';
  

      // Handle redirects first
      if (isOnboarded && isParticipantStatus) {
        router.push('/profile');
        return;
      }

      let userId = searchParams.get('userId');
      
      if (!userId) {
        const loadedUser = loadUser(); // Now returns User | null
        
        if (loadedUser && loadedUser.userId) {
          userId = loadedUser.userId;
        } else {
          router.push('/');
          return
        }
      }

      if (userId) {
        await fetchUserDetails(userId);
      }
    };

    initializeUser();
  }, []);
  const fetchUserDetails = async (userId:string) => {
     // Set loading state
    try {
      const response = await fetch(`https://jlug-lenscape-event-backend.onrender.com/api/participant/users/${userId}`);
      if (response.ok) {
        const result = await response.json();
        const { email, name, picture, isOnboarded, isParticipant } = result;
  
        // Update user state
        setUser({ name, picture, userId, email });
        setTeamMembers([{ name, email, branch: '', collegeName: '', userId }]);
  
        // Redirect if the user is onboarded and a participant
        if (isOnboarded && isParticipant) {
          router.push('/profile');
          return;
        }
  
        // If invited to a team, fetch team details
        if (invitedTeamId) {
          const teamResponse = await fetch(`https://jlug-lenscape-event-backend.onrender.com/api/participant/team/${invitedTeamId}`);
          if (teamResponse.ok) {
            const teamResult = await teamResponse.json();
            setIsInvited(true);
            setInvitedTeamName(teamResult.teamName);
            setTeamName(teamResult.teamName);
            setTeamMembers(teamResult.teamMembers.map(({ member }: { member: TeamMember }) => ({
              name: member.name,
              email: member.email,
              branch: member.branch || '',
              collegeName: member.collegeName || '',
              userId: member.userId || ''
            })));
            setTeamId(invitedTeamId);
          }
        }
      } else if(response.status === 404){
        localStorage.removeItem('onboardedUser');
        localStorage.removeItem('isParticipant');
        localStorage.removeItem('user');
        toast.error("User not found, Please create your account");
        router.push('/');
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsPageLoading(false); // Reset loading state
    }
  };
  

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

  const handleRemoveMember = (index:number) => {
    if (index !== 0) {
      const updatedMembers = teamMembers.filter((_, i) => i !== index);
      setTeamMembers(updatedMembers);
    }
  };

  const handleMemberChange = (index:number, field:string, value:string) => {
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

      if (!isParticipant) {
        const voterData = {
          id:user?.userId,
          email: teamMembers[0].email,
          branch,
          collegeName,
          isParticipant,
        };
        setIsLoading(true);
        await handleSubmission(voterData);
        setIsLoading(false);
      } 
      else if(isInvited){
        const inviteeData = {
          id:user?.userId,
          teamId: invitedTeamId,
          email: user?.email,
          branch,
          collegeName,
          isParticipant:true,
        };
        setIsLoading(true);
        await handleSubmission(inviteeData);
      }
      else {
        setCurrentStep(1);
      }
    } else {
      if (!await validateSubmission()) {
        return;
      }
      console.log(photoType,videoType,digitalArtType);



        const memberIndex = teamMembers.findIndex(member => member.userId === user?.userId);
        teamMembers[memberIndex].branch = branch;
        teamMembers[memberIndex].collegeName = collegeName;
        console.log(1)
        console.log(photoType,videoType,digitalArtType);

      const participantData = {
        teamId,
        teamName,
        teamMembers,
        teamLeader: teamMembers[teamLeaderIndex],
        posts: [
          { category: 'photography', link: photographyLink, title: photographyTitle,type:"image"},
          { category: 'videography', link: videographyLink, title: videographyTitle,type:"video" },
          { category: 'digitalArt', link: digitalArtLink, title: digitalArtTitle,type:"image" }
        ].filter(post => post.link && post.title)
      };
      console.log(participantData);
      await handleSubmission(participantData);
    }
  };

  const handleSubmission = async (data: any) => {
    try {
      setIsLoading(true);
      const endpoint = isInvited 
        ? 'https://jlug-lenscape-event-backend.onrender.com/api/participant/join-team'
        :  'https://jlug-lenscape-event-backend.onrender.com/api/participant/onboarding';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        if(result) localStorage.setItem('onboardedUser', JSON.stringify(true));
        toast.success("Submission successful!");
        if(data.isParticipant==false){
          localStorage.setItem('isParticipant', JSON.stringify(false));
          router.push('/countdown');
         

        }
        else{
          localStorage.setItem('isParticipant', JSON.stringify(true));
          router.push('/profile');
        }
       
      } else {
        if(response.status === 403){
          toast.error("You are not invited to join this team.");
        }
        else{
          toast.error("Failed to submit. Please try again.");
        }
       
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }finally{
      setIsLoading(false);
    }
  };

//   async function checkFileAccessibility(url:string,title:string) {
//     try {
//         setIsDriveChecking(true);
//         const response = await fetch('http://localhost:8000/api/posts/isPublicDrive', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ url }),
//         });

//         const result = await response.json();
  
//         if (response.ok) {
//             if (!result.isPublic) {
//                 toast.error(`The file at ${url} is not public (Content Type: ${result.contentType}).`);
//                 return false; // Not public
//             } 
//             else {
//               console.log(2)
//                 if(title=='photographyTitle'){
//                    setPhotoType(result.type);
//                 }
//                 else if(title=='videographyTitle'){
//                    setVideoType(result.type);
//                 }
//                 else if(title=='digitalArtTitle'){
//                    setDigitalArtType(result.type);
//                 }
//                 toast.success(`The file at ${url} is public.`);
//                 return true; // Public
//             }
//         } else {

//             toast.error(`The file at ${url} is not accessible (status code: ${result.statusCode}).`);
//             return false; // Not accessible
//         }
//     } catch (error) {
//         console.error(`Error checking URL: ${url}`);
//         toast.error(`Error checking URL: ${url}`);
//         return false; // Error in checking
//     }
//     finally{
//       setIsDriveChecking(false);
//     }
// }

  const validateSubmission = async () => {
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

    const isValidGoogleDriveLink = (link:string) => link.includes('drive.google.com');

    // Validate each link format
    
    if (photographyLink && !isValidGoogleDriveLink(photographyLink)) {
        toast.error("Photography link must be a valid Google Drive link.");
        return false;
    }

    if (videographyLink && !isValidGoogleDriveLink(videographyLink)) {
        toast.error("Videography link must be a valid Google Drive link.");
        return false;
    }

    if (digitalArtLink && !isValidGoogleDriveLink(digitalArtLink)) {
        toast.error("Digital Art link must be a valid Google Drive link.");
        return false;
    }

    // Check accessibility of valid links
    // const linksToCheck = [
    //     { link: photographyLink, title: photographyTitle },
    //     { link: videographyLink, title: videographyTitle },
    //     { link: digitalArtLink, title: digitalArtTitle },
    // ];

    // for (const { link, title } of linksToCheck) {
    //     if (link && title) {
    //         const isPublic = await checkFileAccessibility(link, title);
    //         if (!isPublic) {
    //             toast.error(`The link for ${title} is not public or accessible.`);
    //             return false; // If any link is not public, validation fails
    //         }
    //     }
    // }

    return true; // All validations passed
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black p-4">
      {isPageLoading ? <BarLoader color="#ffffff" className='fixed ' />
      :
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
              ? `Welcome ${user?.name.trim().split(" ")[0]}! You've been invited to join ${invitedTeamName}.`
              : `Hello ${user?.name.trim().split(" ")[0]}! Let's complete your profile.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 0 && (
            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                value={user?.email}
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
                    className='outline border-gray-600'
                  />
                  <Label htmlFor="isParticipant" className="ml-2  text-white border-slate-200">Are you a participant?</Label>
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
              <Label className="text-white mt-16">Videography</Label>
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
          <Button  disabled={isLoading || isDriveChecking} onClick={() => currentStep === 0 ? router.push('/') : setCurrentStep(0)}>
            {currentStep === 0 ? "Cancel" : "Back"}
          </Button>
          {isLoading && <BarLoader color="#ffffff" />}
          <div className="flex items-center space-x-2">
  {isDriveChecking && (
    <>
      <CircleLoader color="#4CAF50" size={16} />
      <p className="text-green-500 text-xs font-medium animate-pulse">
        Verifying Google Drive link...
      </p>
    </>
  )}
</div>

          <Button onClick={handleNextStep} disabled={isLoading || isDriveChecking}>
          {currentStep === 0 
          ? (isInvited 
              ? "Join Team" 
              : (isParticipant ? "Next" : "Submit"))
          : "Submit"}

          </Button>
        </div>
      </Card>
    </motion.div>
      }
     
      <ToastContainer />
    </div>
  );
}