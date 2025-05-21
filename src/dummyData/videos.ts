import { VideosProps } from "@/types/index.type";

export const dummyVideos: VideosProps = {
    status: 200,
    data: [
        {
            User: {
                firstname: "John",
                lastname: "Doe",
                image: "https://example.com/user1.jpg",
            },
            id: "vid_001",
            processing: false,
            Folder: {
                id: "folder_01",
                name: "Tutorials",
            },
            createdAt: new Date("2024-10-01T10:00:00Z"),
            title: "How to Use TypeScript",
            source: "https://example.com/videos/vid_001.mp4",
        },
        {
            User: {
                firstname: "Jane",
                lastname: "Smith",
                image: null,
            },
            id: "vid_003",
            processing: false,
            Folder: {
                id: "folder_02",
                name: "Interviews",
            },
            createdAt: new Date("2025-01-20T14:45:00Z"),
            title: "Interview with a Developer",
            source: "https://example.com/videos/vid_003.mp4",
        },
    ],
};