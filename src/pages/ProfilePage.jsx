import React, { useState } from "react";
import ProfileSidebar from "../components/ProfileSidebar";
import ProfileSettings from "../components/ProfileSettings";
import TestHistory from "../components/TestHistory";

const ProfilePage = () => {
  const [activeSection, setActiveSection] = useState("settings");

  const renderSection = () => {
    switch (activeSection) {
      case "history":
        return <TestHistory />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <ProfileSidebar onSelectSection={setActiveSection} />
      <div className="flex-1 p-6">{renderSection()}</div>
    </div>
  );
};

export default ProfilePage;