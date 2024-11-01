
export interface Post {
  _id: string;
  id: string;
  title: string;
  category: 'photography' | 'videography' | 'digital art';
  url: string;
  likes: number;
  domain: string;
  votes: string[];
  type: string; 
  teamId: string;
  teamName:string
}


  export interface UserPosts{
    _id:string
    posts:Post[]
   
    teamName:string
  }

  export interface Submission {
    _id: string
    teamName: string
    domain: string
    title: string
    url: string
    type: string
    votes: string[]
  }
  