import React from "react"; 
import BackgroundImages from "../components/BackgroundImages"; // Фоновые изображения
import Tips from "../components/Tips"; // Новый компонент
import AiMain from "../components/AiMain" ;// Убедись, что путь правильный
import TextMain from "../components/TextMain" ;
const HomePage = () => {
  return (
    <div>
      <BackgroundImages /> 
      <AiMain/>
      <Tips/> {/* Добавляем HealthTips */}
      <TextMain/> 
      
    </div>
  );
};

export default HomePage;
