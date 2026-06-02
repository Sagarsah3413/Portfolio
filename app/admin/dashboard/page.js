"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("header");
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [formData, setFormData] = useState({});
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            router.push("/admin/login");
            return;
        }
        fetchContent();
    }, []);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/content");
            const data = await response.json();

            if (Array.isArray(data)) {
                const contentMap = {};
                data.forEach((item) => {
                    contentMap[item.section] = item.data;
                });
                setContent(contentMap);
            } else {
                setContent({
                    header: {
                        name: "Sagar Kumar Sah",
                        title: "Software Developer",
                        bio: "I'm Sagar Kumar Sah, a full-stack software engineer...",
                    },
                    about: { description: "" },
                    work: [],
                    certifications: [],
                });
            }
        } catch (error) {
            setMessage("Error fetching content: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setContent((prev) => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                [field]: value,
            },
        }));
    };

    const handleAddItem = () => {
        setFormData({
            title: "",
            description: "",
            bgImage: "",
            link: "",
        });
        setEditingIndex(-1);
    };

    const handleEditItem = (index) => {
        setFormData(content[activeTab][index]);
        setEditingIndex(index);
    };

    const handleSaveItem = () => {
        if (!formData.title || !formData.description || !formData.bgImage || !formData.link) {
            setMessage("All fields (Title, Description, Image URL, Link) are required");
            return;
        }

        setContent((prev) => {
            const updated = { ...prev };
            if (editingIndex === -1) {
                updated[activeTab] = [...(updated[activeTab] || []), formData];
            } else {
                updated[activeTab][editingIndex] = formData;
            }
            return updated;
        });

        setFormData({});
        setEditingIndex(null);
        setMessage("Item saved locally. Click 'Save Changes' to persist to database.");
        setTimeout(() => setMessage(""), 3000);
    };

    const handleDeleteItem = (index) => {
        setContent((prev) => ({
            ...prev,
            [activeTab]: prev[activeTab].filter((_, i) => i !== index),
        }));
        setMessage("Item deleted. Click 'Save Changes' to persist to database.");
        setTimeout(() => setMessage(""), 3000);
    };

    const handleCancelEdit = () => {
        setFormData({});
        setEditingIndex(null);
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setMessage("Please select a valid image file");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setMessage("Image size must be less than 5MB");
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const token = localStorage.getItem("adminToken");
            const formDataToSend = new FormData();
            formDataToSend.append("file", file);

            const xhr = new XMLHttpRequest();

            // Track upload progress
            xhr.upload.addEventListener("progress", (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    setUploadProgress(Math.round(percentComplete));
                }
            });

            // Handle completion
            xhr.addEventListener("load", () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    setFormData((prev) => ({
                        ...prev,
                        bgImage: response.url,
                    }));
                    setMessage("Image uploaded successfully!");
                    setTimeout(() => setMessage(""), 3000);
                } else {
                    const response = JSON.parse(xhr.responseText);
                    setMessage("Upload failed: " + (response.error || "Unknown error"));
                }
                setUploading(false);
                setUploadProgress(0);
            });

            // Handle error
            xhr.addEventListener("error", () => {
                setMessage("Upload error: " + xhr.statusText);
                setUploading(false);
                setUploadProgress(0);
            });

            xhr.open("POST", "/api/upload");
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            xhr.send(formDataToSend);
        } catch (error) {
            setMessage("Error uploading image: " + error.message);
            setUploading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const event = { target: { files } };
            handleImageUpload(event);
        }
    };

    const handleResumeUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (file.type !== "application/pdf") {
            setMessage("Please select a PDF file");
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setMessage("Resume size must be less than 10MB");
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const token = localStorage.getItem("adminToken");
            const formDataToSend = new FormData();
            formDataToSend.append("file", file);
            formDataToSend.append("type", "resume");

            const xhr = new XMLHttpRequest();

            // Track upload progress
            xhr.upload.addEventListener("progress", (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    setUploadProgress(Math.round(percentComplete));
                }
            });

            // Handle completion
            xhr.addEventListener("load", () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    setContent((prev) => ({
                        ...prev,
                        resume: { path: response.url },
                    }));
                    setMessage("Resume uploaded successfully!");
                    setTimeout(() => setMessage(""), 3000);
                } else {
                    const response = JSON.parse(xhr.responseText);
                    setMessage("Upload failed: " + (response.error || "Unknown error"));
                }
                setUploading(false);
                setUploadProgress(0);
            });

            // Handle error
            xhr.addEventListener("error", () => {
                setMessage("Upload error: " + xhr.statusText);
                setUploading(false);
                setUploadProgress(0);
            });

            xhr.open("POST", "/api/upload");
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            xhr.send(formDataToSend);
        } catch (error) {
            setMessage("Error uploading resume: " + error.message);
            setUploading(false);
        }
    };

    const handleResumeDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const event = { target: { files } };
            handleResumeUpload(event);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem("adminToken");
            const response = await fetch("/api/content", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    section: activeTab,
                    data: content[activeTab],
                }),
            });

            if (response.ok) {
                setMessage("Content saved successfully!");
                setTimeout(() => setMessage(""), 3000);
            } else {
                const data = await response.json();
                setMessage("Error: " + (data.error || "Failed to save"));
            }
        } catch (error) {
            setMessage("Error: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        router.push("/");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Portfolio Admin Dashboard
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4">
                {/* Message */}
                {message && (
                    <div
                        className={`mb-4 p-4 rounded-lg ${message.includes("Error")
                            ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200"
                            : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200"
                            }`}
                    >
                        {message}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Tabs */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-2">
                            {["header", "about", "work", "certifications", "resume"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`w-full text-left px-4 py-2 rounded-lg capitalize font-medium transition ${activeTab === tab
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Editor */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            {activeTab === "header" && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                        Edit Header Section
                                    </h2>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={content.header?.name || ""}
                                            onChange={(e) =>
                                                handleInputChange("name", e.target.value)
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={content.header?.title || ""}
                                            onChange={(e) =>
                                                handleInputChange("title", e.target.value)
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Bio/Description
                                        </label>
                                        <textarea
                                            value={content.header?.bio || ""}
                                            onChange={(e) => handleInputChange("bio", e.target.value)}
                                            rows="6"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="mt-6 flex justify-end gap-4">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition"
                                        >
                                            {saving ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === "about" && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                        Edit About Section
                                    </h2>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            About Description
                                        </label>
                                        <textarea
                                            value={content.about?.description || ""}
                                            onChange={(e) =>
                                                handleInputChange("description", e.target.value)
                                            }
                                            rows="8"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="mt-6 flex justify-end gap-4">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition"
                                        >
                                            {saving ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === "work" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                            Edit Work Section
                                        </h2>

                                        {/* Form for adding/editing items */}
                                        {editingIndex !== null && (
                                            <div className="mb-6 p-4 border border-blue-300 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                    {editingIndex === -1 ? "Add New Project" : "Edit Project"}
                                                </h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Project Title *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.title || ""}
                                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                            placeholder="e.g., TalkToDoc"
                                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Description *
                                                        </label>
                                                        <textarea
                                                            value={formData.description || ""}
                                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                            placeholder="e.g., Telemedicine Platform"
                                                            rows="3"
                                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Image *
                                                        </label>
                                                        <div
                                                            onDragOver={handleDragOver}
                                                            onDrop={handleDrop}
                                                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-700 transition"
                                                        >
                                                            <input
                                                                type="file"
                                                                id="work-image-upload"
                                                                accept="image/*"
                                                                onChange={handleImageUpload}
                                                                disabled={uploading}
                                                                className="hidden"
                                                            />
                                                            <label
                                                                htmlFor="work-image-upload"
                                                                className="flex flex-col items-center justify-center cursor-pointer py-4"
                                                            >
                                                                <svg
                                                                    className="w-10 h-10 text-gray-400 mb-2"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M12 4v16m8-8H4"
                                                                    />
                                                                </svg>
                                                                <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
                                                                    {uploading ? (
                                                                        <>
                                                                            <span>Uploading... {uploadProgress}%</span>
                                                                            <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                                                                                <div
                                                                                    className="bg-blue-600 h-2 rounded-full"
                                                                                    style={{ width: `${uploadProgress}%` }}
                                                                                />
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <span className="font-medium">Click to upload</span>
                                                                            <span className="text-xs text-gray-500">or drag and drop</span>
                                                                        </>
                                                                    )}
                                                                </p>
                                                            </label>
                                                        </div>
                                                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">OR paste image URL:</div>
                                                        <input
                                                            type="text"
                                                            value={formData.bgImage || ""}
                                                            onChange={(e) => setFormData({ ...formData, bgImage: e.target.value })}
                                                            placeholder="e.g., /talktodoc.png or https://example.com/image.png"
                                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                        />
                                                        {formData.bgImage && (
                                                            <div className="mt-3">
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                                                                <img
                                                                    src={formData.bgImage}
                                                                    alt="Preview"
                                                                    className="w-32 h-32 object-cover rounded shadow"
                                                                    onError={(e) => { e.target.src = "/placeholder.png"; }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Project Link *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.link || ""}
                                                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                                            placeholder="e.g., https://example.com or https://github.com/..."
                                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2 pt-4">
                                                        <button
                                                            onClick={handleSaveItem}
                                                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                                                        >
                                                            Save Item
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white font-medium rounded-lg"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* List of projects */}
                                        <div className="space-y-4">
                                            {content.work && content.work.length > 0 ? (
                                                content.work.map((project, index) => (
                                                    <div
                                                        key={index}
                                                        className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg flex justify-between items-start"
                                                    >
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                                {project.title}
                                                            </h3>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {project.description}
                                                            </p>
                                                            <a
                                                                href={project.link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                                            >
                                                                {project.link}
                                                            </a>
                                                        </div>
                                                        <div className="flex gap-2 ml-4">
                                                            <button
                                                                onClick={() => handleEditItem(index)}
                                                                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteItem(index)}
                                                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-600 dark:text-gray-400">No projects added yet.</p>
                                            )}
                                        </div>

                                        {editingIndex === null && (
                                            <button
                                                onClick={handleAddItem}
                                                className="mt-4 w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                                            >
                                                + Add New Project
                                            </button>
                                        )}
                                    </div>

                                    {editingIndex === null && (
                                        <div className="mt-6 flex justify-end gap-4">
                                            <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition"
                                            >
                                                {saving ? "Saving..." : "Save All Changes"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "certifications" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                            Edit Certifications Section
                                        </h2>

                                        {/* Form for adding/editing items */}
                                        {editingIndex !== null && (
                                            <div className="mb-6 p-4 border border-blue-300 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                    {editingIndex === -1 ? "Add New Certification" : "Edit Certification"}
                                                </h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Certification Title *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.title || ""}
                                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                            placeholder="e.g., MongoDB Node.js Developer Path"
                                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Description *
                                                        </label>
                                                        <textarea
                                                            value={formData.description || ""}
                                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                            placeholder="Describe the certification..."
                                                            rows="3"
                                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Certificate Image *
                                                        </label>
                                                        <div
                                                            onDragOver={handleDragOver}
                                                            onDrop={handleDrop}
                                                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-700 transition"
                                                        >
                                                            <input
                                                                type="file"
                                                                id="cert-image-upload"
                                                                accept="image/*"
                                                                onChange={handleImageUpload}
                                                                disabled={uploading}
                                                                className="hidden"
                                                            />
                                                            <label
                                                                htmlFor="cert-image-upload"
                                                                className="flex flex-col items-center justify-center cursor-pointer py-4"
                                                            >
                                                                <svg
                                                                    className="w-10 h-10 text-gray-400 mb-2"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M12 4v16m8-8H4"
                                                                    />
                                                                </svg>
                                                                <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
                                                                    {uploading ? (
                                                                        <>
                                                                            <span>Uploading... {uploadProgress}%</span>
                                                                            <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                                                                                <div
                                                                                    className="bg-blue-600 h-2 rounded-full"
                                                                                    style={{ width: `${uploadProgress}%` }}
                                                                                />
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <span className="font-medium">Click to upload</span>
                                                                            <span className="text-xs text-gray-500">or drag and drop</span>
                                                                        </>
                                                                    )}
                                                                </p>
                                                            </label>
                                                        </div>
                                                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">OR paste image URL:</div>
                                                        <input
                                                            type="text"
                                                            value={formData.bgImage || ""}
                                                            onChange={(e) => setFormData({ ...formData, bgImage: e.target.value })}
                                                            placeholder="e.g., /MongoDB_Nodejs_Developer_Path.png"
                                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                        />
                                                        {formData.bgImage && (
                                                            <div className="mt-3">
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                                                                <img
                                                                    src={formData.bgImage}
                                                                    alt="Preview"
                                                                    className="w-32 h-32 object-cover rounded shadow"
                                                                    onError={(e) => { e.target.src = "/placeholder.png"; }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Verification Link *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.link || ""}
                                                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                                            placeholder="e.g., https://learn.mongodb.com/..."
                                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2 pt-4">
                                                        <button
                                                            onClick={handleSaveItem}
                                                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                                                        >
                                                            Save Item
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white font-medium rounded-lg"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* List of certifications */}
                                        <div className="space-y-4">
                                            {content.certifications && content.certifications.length > 0 ? (
                                                content.certifications.map((cert, index) => (
                                                    <div
                                                        key={index}
                                                        className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg flex justify-between items-start"
                                                    >
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                                {cert.title}
                                                            </h3>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {cert.description}
                                                            </p>
                                                            <a
                                                                href={cert.link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                                            >
                                                                View Certificate
                                                            </a>
                                                        </div>
                                                        <div className="flex gap-2 ml-4">
                                                            <button
                                                                onClick={() => handleEditItem(index)}
                                                                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteItem(index)}
                                                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-600 dark:text-gray-400">No certifications added yet.</p>
                                            )}
                                        </div>

                                        {editingIndex === null && (
                                            <button
                                                onClick={handleAddItem}
                                                className="mt-4 w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                                            >
                                                + Add New Certification
                                            </button>
                                        )}
                                    </div>

                                    {editingIndex === null && (
                                        <div className="mt-6 flex justify-end gap-4">
                                            <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition"
                                            >
                                                {saving ? "Saving..." : "Save All Changes"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "resume" && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                        Edit Resume
                                    </h2>

                                    {/* Current Resume */}
                                    {content.resume?.path && (
                                        <div className="p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                                            <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-3">
                                                Current Resume:
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <a
                                                    href={content.resume.path}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                                >
                                                    📄 {content.resume.path.split("/").pop()}
                                                </a>
                                                <button
                                                    onClick={() => {
                                                        setContent((prev) => ({
                                                            ...prev,
                                                            resume: { path: null },
                                                        }));
                                                    }}
                                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Resume Upload Area */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Upload Resume (PDF) *
                                        </label>
                                        <div
                                            onDragOver={handleDragOver}
                                            onDrop={handleResumeDrop}
                                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-700 transition cursor-pointer"
                                        >
                                            <input
                                                type="file"
                                                id="resume-upload"
                                                accept=".pdf,application/pdf"
                                                onChange={handleResumeUpload}
                                                disabled={uploading}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="resume-upload"
                                                className="flex flex-col items-center justify-center cursor-pointer"
                                            >
                                                <svg
                                                    className="w-12 h-12 text-gray-400 mb-3"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                <p className="text-gray-600 dark:text-gray-400 text-center">
                                                    {uploading ? (
                                                        <>
                                                            <span className="font-medium">Uploading... {uploadProgress}%</span>
                                                            <div className="w-full bg-gray-300 rounded-full h-2 mt-3">
                                                                <div
                                                                    className="bg-blue-600 h-2 rounded-full"
                                                                    style={{ width: `${uploadProgress}%` }}
                                                                />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="font-medium block mb-1">Click to upload Resume</span>
                                                            <span className="text-xs text-gray-500">or drag and drop (PDF, max 10MB)</span>
                                                        </>
                                                    )}
                                                </p>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Save Button */}
                                    <div className="mt-6 flex justify-end gap-4">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving || !content.resume?.path}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition"
                                        >
                                            {saving ? "Saving..." : "Save Resume"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
