import React from "react"; 
import BackgroundImages from "../components/BackgroundImages"; // Фоновые изображения
import Tips from "../components/Tips"; // Новый компонент
import AiMain from "../components/AiMain" ;// Убедись, что путь правильный
import TextMain from "../components/TextMain" ;
import Reviews from "../components/Reviews" ;
import LoginModal from "../components/LoginModal" ;

const HomePage = () => {
  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>

      <BackgroundImages /> 
      <AiMain/>
      <Tips/> {/* Добавляем HealthTips */}
      <TextMain/> 
      <Reviews/> 
      <LoginModal/> 

      
    </div>
  );
};

export default HomePage;
