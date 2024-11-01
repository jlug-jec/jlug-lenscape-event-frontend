export interface UserData {
    name: string;
    picture: string;
    branch: string;
    collegeName: string;
    isParticipant: boolean;
    isTeamLeader: boolean;
    team: {
      teamName: string;
      _id: string;
      teamId: string;

    };
}
export interface TeamMembers {
  _id: string;
  name: string;
  picture: string;
}
export interface TeamMember {
  name: string;
  email: string;
  branch: string;
  collegeName: string;
  userId: string | null | undefined;
  [key: string]: any;
}