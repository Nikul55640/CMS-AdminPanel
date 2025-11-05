import React, { useState } from "react";
import { ArrowLeft, Eye, MoreVertical, X, Upload, Trash2 } from "lucide-react";

import RichTextEditor from "../components/Blogpage/RichTextEditor";
import SEOPreview from "../components/Blogpage/SEOPreview";
import { ImageWithFallback } from "../components/Blogpage/ImageWithFallback";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import toast from "react-hot-toast";

const BlogPage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [author, setAuthor] = useState("admin");
  const [blog, setBlog] = useState("news");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState("draft");
  const [publishDate, setPublishDate] = useState(new Date());
  const [featuredImage, setFeaturedImage] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [urlHandle, setUrlHandle] = useState("");

  // ---- Tag Management ----
  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // ---- Save Actions ----
  const handleSave = (saveType) => {
    toast.success(
      saveType === "draft"
        ? "Post saved as draft"
        : "Post published successfully"
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER (Optional) */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
           
            <h1 className="text-xl font-semibold">Create blog post</h1>
          </div>

          <div className="flex items-center gap-2">
           
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleSave("draft")}>
              Save as draft
            </Button>
            <Button size="sm" onClick={() => handleSave("publish")}>
              Publish
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <Card>
              <CardContent className="pt-6">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Blog post title"
                  className="text-xl border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write your blog post content here..."
                />
              </CardContent>
            </Card>

            {/* Excerpt */}
            <Card>
              <CardHeader>
                <CardTitle>Excerpt</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Short description of the blog post"
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Add a summary that will be displayed in search results and on
                  your blog page.
                </p>
              </CardContent>
            </Card>

            {/* Organization */}
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Author */}
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Select value={author} onValueChange={setAuthor}>
                    <SelectTrigger id="author">
                      <SelectValue placeholder="Select author" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="sarah">Sarah Johnson</SelectItem>
                      <SelectItem value="michael">Michael Chen</SelectItem>
                      <SelectItem value="emily">Emily Rodriguez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Blog */}
                <div className="space-y-2">
                  <Label htmlFor="blog">Blog</Label>
                  <Select value={blog} onValueChange={setBlog}>
                    <SelectTrigger id="blog">
                      <SelectValue placeholder="Select blog category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="news">News</SelectItem>
                      <SelectItem value="updates">Updates</SelectItem>
                      <SelectItem value="tutorials">Tutorials</SelectItem>
                      <SelectItem value="announcements">
                        Announcements
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Add tags"
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      variant="secondary"
                    >
                      Add
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="pl-2 pr-1"
                        >
                          {tag}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1 hover:bg-transparent"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SEO Section */}
            <Card>
              <CardHeader>
                <CardTitle>Search engine listing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SEOPreview
                  title={seoTitle || title}
                  description={seoDescription || excerpt}
                  url={
                    urlHandle
                      ? `your-store.myshopify.com/blogs/${blog}/${urlHandle}`
                      : `your-store.myshopify.com/blogs/${blog}/${title
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`
                  }
                />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="seoTitle">Page title</Label>
                    <Input
                      id="seoTitle"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder={title || "Blog post title"}
                    />
                    <p className="text-xs text-muted-foreground">
                      {seoTitle.length} of 70 characters used
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seoDescription">Meta description</Label>
                    <Textarea
                      id="seoDescription"
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder={excerpt || "Short description"}
                      className="min-h-[80px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      {seoDescription.length} of 320 characters used
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urlHandle">URL handle</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-sm border border-r-0 rounded-l-md bg-muted text-muted-foreground">
                        /blogs/{blog}/
                      </span>
                      <Input
                        id="urlHandle"
                        value={urlHandle}
                        onChange={(e) => setUrlHandle(e.target.value)}
                        placeholder={title.toLowerCase().replace(/\s+/g, "-")}
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>

                {status === "scheduled" && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Publish date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                          >
                            {publishDate
                              ? publishDate.toLocaleDateString()
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={publishDate}
                            onSelect={setPublishDate}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>Featured image</CardTitle>
              </CardHeader>
              <CardContent>
                {!featuredImage ? (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drop image here or click to upload
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFeaturedImage(
                          "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800"
                        )
                      }
                    >
                      Add image
                    </Button>
                  </div>
                ) : (
                  <div className="relative group">
                    <ImageWithFallback
                      src={featuredImage}
                      alt="Featured"
                      className="w-full rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setFeaturedImage("")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Publishing Info */}
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last updated</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Online Store */}
            <Card>
              <CardHeader>
                <CardTitle>Online store</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Theme template</p>
                    <p className="text-xs text-muted-foreground">article</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Change
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlogPage;
