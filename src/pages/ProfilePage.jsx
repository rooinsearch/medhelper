import React from "react";
import ProfileSidebar from "../components/ProfileSidebar";

/**
 * Страница профиля теперь просто показывает Sidebar.
 * Сам контент (ProfileSettings / TestHistory / …) рендерится внутри Sidebar.
 */
const ProfilePage = () => (
  <div className="flex min-h-screen bg-gray-100">
    <ProfileSidebar />
  </div>
);

export default ProfilePage;
