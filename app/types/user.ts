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