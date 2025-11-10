import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";

import { ArrowLeft, Eye, Upload, Trash2 } from "lucide-react";
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
import { Separator } from "../components/ui/separator";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";

const AddBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API = "http://localhost:5000/api/blogs";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); // backend expects `description`
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("admin");
  const [category, setCategory] = useState("news"); // backend uses `category` instead of `blog`
  const [tags, setTags] = useState([]);

  const [status, setStatus] = useState("draft");
  const [publishDate, setPublishDate] = useState(new Date());
  const [imageUrl, setImageUrl] = useState(""); // backend field for featured image
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [urlHandle, setUrlHandle] = useState("");

  // Fetch existing blog for edit

  useEffect(() => {
    if (id) {
      axios
        .get(`${API}/${id}`)
        .then((res) => {
          const data = res.data;
          setTitle(data.title);
          setDescription(data.description || "");
          setContent(data.content);
          setAuthor(data.author || "admin");
          setCategory(data.category || "news");
          setTags(data.tags || []);
          setStatus(data.status || "draft");
          setPublishDate(
            data.publishedAt ? new Date(data.publishedAt) : new Date()
          );
          setImageUrl(data.imageUrl || "");
          setSeoTitle(data.seoTitle || "");
          setSeoDescription(data.seoDescription || "");
          setUrlHandle(data.urlHandle || "");
        })
        .catch(() => toast.error("Failed to load blog post"));
    }
  }, [id]);

  // Save or Publish Blog
  const handleSave = async (saveType) => {
    const payload = {
      title,
      description,
      content,
      author,
      category,
      tags,
      status: saveType === "draft" ? "draft" : "published",
      publishedAt: publishDate,
      imageUrl,
      seoTitle,
      seoDescription,
      urlHandle,
    };

    try {
      if (id) {
        await axios.put(`${API}/${blog.id}`, payload);
        toast.success("Blog post updated!");
      } else {
        await axios.post(`${API}/`, payload);
        toast.success("Blog post created!");
      }
      navigate("/admin/blog");
    } catch (error) {
      toast.error("Failed to save post");
      console.error(error);
    }
    console.log(payload);
  };

  return (
    <div className="min-h-screen p-2 mx-auto bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-purple-500 mt-4 border rounded-t-2xl top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl text-white font-semibold">
            {id ? "Edit Blog Post" : "Create Blog Post"}
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="mr-2 bg-white cursor-pointer"
              size="sm"
            >
              <Eye className="w-4 h-4" /> Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="mr-2 bg-gray-600 text-white cursor-pointer"
              onClick={() => handleSave("draft")}
            >
              Save Draft
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-green-600 text-white cursor-pointer"
              onClick={() => handleSave("published")}
            >
              Publish
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <Card className="bg-gray-200">
              <CardHeader>
                <CardTitle>Title :-</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Blog post title"
                  className="text-xl border -mt-2 mb "
                />
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="bg-gray-200">
              <CardHeader>
                <CardTitle>Description :-</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short summary / excerpt"
                  className="min-h-[80px]"
                />
              </CardContent>
            </Card>

            {/* Content */}
            <Card className="bg-gray-200">
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <RichTextEditor value={content} onChange={setContent} />
              </CardContent>
            </Card>

            {/* SEO */}
            <Card className="bg-gray-200">
              <CardHeader>
                <CardTitle>Search Engine Listing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SEOPreview
                  title={seoTitle || title}
                  description={seoDescription || description}
                  url={`/blogs/${category}/${
                    urlHandle || title.toLowerCase().replace(/\s+/g, "-")
                  }`}
                />
                <Label>Page Title</Label>
                <Input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />
                <Label>Meta Description</Label>
                <Textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                />
                <Label>URL Handle</Label>
                <Input
                  value={urlHandle}
                  onChange={(e) => setUrlHandle(e.target.value)}
                  placeholder={title.toLowerCase().replace(/\s+/g, "-")}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Side */}
          <div className="space-y-6 ">
            {/* Featured Image */}
            <Card className="bg-gray-200">
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent className="bg-white">
                {!imageUrl ? (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setImageUrl(
                          "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800"
                        )
                      }
                    >
                      Upload Image
                    </Button>
                  </div>
                ) : (
                  <div className="relative group">
                    <ImageWithFallback
                      src={imageUrl}
                      alt="Featured"
                      className="w-full rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setImageUrl("")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Publish Options */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="bg-gray-200" value="draft">
                      Draft
                    </SelectItem>
                    <SelectItem className="bg-green-600" value="published">
                      Published
                    </SelectItem>
                    <SelectItem className="bg-yellow-600 " value="scheduled">
                      Scheduled
                    </SelectItem>
                  </SelectContent>
                </Select>
                {status === "scheduled" && (
                  <>
                    <Separator className="my-2" />
                    <Label>Publish Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          {publishDate.toLocaleDateString()}
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
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddBlog;
