"use client"
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Upload } from "lucide-react";
import { postApi } from '../app/api/posts';
import { toast } from 'react-toastify';
import useUserStore from '@/store/useUserStore';
import "react-toastify/dist/ReactToastify.css";
import { Post } from '../app/types/post';
import { BarLoader } from 'react-spinners';
import { getUserDetails } from '@/app/api/userApi';

export function EditPostDialog({ post, onPostUpdate,isTeamLeader }: { post: Post; onPostUpdate: (title: string, url: string,type:string) => void ,isTeamLeader:boolean}) {
  const [editedPost, setEditedPost] = useState(post);
  const [isLoading, setIsLoading] = useState(false);
  const { user, loadUser } = useUserStore();

  let jwtToken:null|string=null;
  let refreshToken:string|null


  const handleSave = async () => {
    if (isTeamLeader) {
      toast.error("Only team leaders can edit posts.");
      return;
    }
    setIsLoading(true);
    try {
      
      const updatedPost = await postApi.editPost(post._id, editedPost,jwtToken,refreshToken);
      
      if(updatedPost){
        console.log(updatedPost)
        onPostUpdate(updatedPost.post.title,updatedPost.post.url,updatedPost.type);
        toast.success(updatedPost.message);
        toast.info("Post updated successfully, refresh the page to see changes");
      }
      
    } catch (error) {
      setEditedPost(post)
     
    } finally {
      setIsLoading(false);
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center fixed inset-0 bg-gray-700 bg-opacity-50 z-50">
      <BarLoader color='#ffff'  />
      </div>
    )
  
}

  return (
    <Dialog>
    
      <DialogTrigger asChild>
        <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" aria-description='dialog'>
        <DialogHeader>
          <DialogTitle>Edit {post.category} Post</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input
              id="title"
              value={editedPost.title}
              onChange={(e) => setEditedPost({ ...editedPost, title: e.target.value })}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">Media URL</Label>
            <Input
              id="url"
              value={editedPost.url}
              onChange={(e) => setEditedPost({ ...editedPost, url: e.target.value })}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">Media Type</Label>
            <select
              id="type"
              value={editedPost.type}
              onChange={(e) => setEditedPost({ ...editedPost, type: e.target.value })}
              className="col-span-3"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>
        </div>
        <DialogClose>
          {isLoading ? <BarLoader color="#ffffff" /> : 
            <Button onClick={handleSave} disabled={isLoading || isTeamLeader}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>}
      
      </DialogClose>
       
      </DialogContent>
    </Dialog>
  );
}

export function UploadDialog({ category, onPostUpdate,isTeamLeader,teamName,teamId }: { category: string; onPostUpdate: (title: string, url: string,type:string) => void,isTeamLeader:boolean ,teamName:string,teamId:string}) {
  const [newPost, setNewPost] = useState({ title: '', url: '', category, teamId, teamName, type: 'image' });
  const [isLoading, setIsLoading] = useState(false);
  let jwtToken:null|string=null;
  let refreshToken:string|null


  const handleUpload = async () => {
    if (isTeamLeader) {
    
      toast.error("Only team leaders can upload posts.");
      return;
    }
    if(newPost.title.trim() === '' || newPost.url.trim() === ''){

      toast.error("Both title and url is necessary");


      return;
    }
  
  
    try {
      setIsLoading(true);
      const createdPost = await postApi.createPost({
        ...newPost,
        _id: '',
        id: '',
        likes: 0,
        domain: '',
        votes: [],
        category: category as "photography" | "videography" | "digital art",
        type: newPost.type ,
      },jwtToken,refreshToken);
      if(createdPost){
        console.log(createdPost)
        onPostUpdate(newPost.title,newPost.url,newPost.type);
        toast.success(createdPost.message);
        toast.info("Post updated successfully, refresh the page to see changes");
      }
    
    } catch (error) {

      setNewPost({ title: '', url: '', category, teamId, teamName, type: 'image' })
    } finally {
      setIsLoading(false);
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center fixed inset-0 bg-gray-700 bg-opacity-50 z-50">
      <BarLoader color='#ffff'  />
      </div>
    )
  
}
 
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Upload</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload {category} Post</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input
              id="title"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">Media URL</Label>
            <Input
              id="url"
              value={newPost.url}
              onChange={(e) => setNewPost({ ...newPost, url: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">Media Type</Label>
            <select
              id="type"
              value={newPost.type}
              onChange={(e) => setNewPost({ ...newPost, type: e.target.value})}
              className="col-span-3"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>
        </div>
        <DialogClose>
        <Button onClick={handleUpload} disabled={isLoading}>
          {isLoading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
