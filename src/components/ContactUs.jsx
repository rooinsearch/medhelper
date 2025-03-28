import React, { useRef, useState } from "react";
import { useMediaQuery, Divider, Snackbar, Alert } from "@mui/material";
import { FaInstagram, FaTelegram, FaWhatsapp } from "react-icons/fa";
import axios from "axios";

const ContactUs = () => {
  const contactRef = useRef(null);
  const isMobile = useMediaQuery("(max-width:768px)");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/contact/", formData);
      
      console.log("Form submitted successfully:", response.data);
      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: ""
      });
      
      setSnackbar({
        open: true,
        message: "Your message has been sent successfully!",
        severity: "success"
      });
      
    } catch (error) {
      console.error("Error submitting form:", error.response?.data || error.message);
      
      if (error.response?.status === 400) {
        // Handle backend validation errors
        setErrors(error.response.data);
      } else {
        setSnackbar({
          open: true,
          message: "Failed to send message. Please try again later.",
          severity: "error"
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <div 
      id="help-support"
      ref={contactRef}
      style={{ 
        width: "100%",
        minHeight: isMobile ? "auto" : "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: isMobile ? "40px 20px" : "20px",
        position: isMobile ? "relative" : "absolute",
        top: isMobile ? "0" : "245vh",
        right: 0,
        zIndex: 10,
        marginTop: isMobile ? "-100px" : "0",
        backgroundColor: "transparent"
      }}
    >
      {/* Основной контейнер формы */}
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        width: "100%",
        maxWidth: "750px",
        height: "auto",
        backgroundColor: "rgba(255, 255, 255, 0.97)",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
        zIndex: 11,
        backdropFilter: "blur(4px)",
        marginTop: isMobile ? "0" : "0"
      }}>
        {/* Left Section - Get in Touch */}
        <div style={{
          backgroundColor: "#001A00",
          color: "white",
          padding: isMobile ? "20px" : "30px",
          width: isMobile ? "100%" : "40%",
          order: isMobile ? 2 : 1
        }}>
          <h2 style={{ 
            fontSize: isMobile ? "24px" : "28px", 
            margin: "0 0 20px 0",
            fontWeight: 600
          }}>Get in Touch</h2>
          
          {/* Contact Items */}
          {[
            { icon: "📍", title: "Head Office", text: "Abylaikhan Str. 1/1" },
            { icon: "✉️", title: "Email Us", text: "210107166@stu.sdu.edu.kz" },
            { icon: "📞", title: "Call Us", text: "+7707070707" }
          ].map((item, index) => (
            <div key={index} style={{ 
              display: "flex", 
              alignItems: "center", 
              marginBottom: "20px",
              flexWrap: "wrap"
            }}>
              <div style={{ 
                width: "40px", 
                height: "40px", 
                backgroundColor: "white", 
                borderRadius: "50%", 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center",
                marginRight: "15px",
                flexShrink: 0
              }}>
                <span style={{ color: "#001A00" }}>{item.icon}</span>
              </div>
              <div>
                <h3 style={{ margin: "0", fontSize: "16px", fontWeight: 500 }}>{item.title}</h3>
                <p style={{ margin: "5px 0 0 0", fontSize: "14px" }}>{item.text}</p>
              </div>
            </div>
          ))}
          
          <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", my: 2 }} />
          
          {/* Social Media */}
          <p style={{ fontSize: "16px", margin: "20px 0 15px 0", fontWeight: 500 }}>Follow Our Social Media</p>
          
          <div style={{ display: "flex", gap: "15px" }}>
            {[
              { icon: <FaInstagram size={20} />, url: "https://www.instagram.com/ademizhann?igsh=MWloZWhvMmVjanN4dw%3D%3D&utm_source=qr" },
              { icon: <FaTelegram size={20} />, url: "https://t.me/aromashkaaaaaaaa" },
              { icon: <FaWhatsapp size={20} />, url: "https://wa.me/77475910535" }
            ].map((social, index) => (
              <a 
                key={index} 
                href={social.url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  width: "40px", 
                  height: "40px", 
                  backgroundColor: "white", 
                  borderRadius: "50%", 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "transform 0.3s",
                  textDecoration: "none",
                  color: "#001A00",
                  ':hover': {
                    transform: "scale(1.1)"
                  }
                }}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
        
        {/* Right Section - Send Us a Message */}
        <div style={{ 
          padding: isMobile ? "25px" : "30px", 
          width: isMobile ? "100%" : "60%",
          order: 1
        }}>
          <h2 style={{ 
            fontSize: isMobile ? "24px" : "28px", 
            color: "#001A00", 
            margin: "0 0 25px 0",
            fontWeight: 600
          }}>Send Us a Message</h2>
          
          <form onSubmit={handleSubmit}>
            {[
              { type: "text", name: "name", placeholder: "Name", value: formData.name, error: errors.name },
              { type: "email", name: "email", placeholder: "Email Address", value: formData.email, error: errors.email },
              { type: "tel", name: "phone", placeholder: "Phone Number", value: formData.phone, error: errors.phone },
              { type: "text", name: "message", placeholder: "Message", value: formData.message, error: errors.message }
            ].map((field, index) => (
              <div key={index} style={{ marginBottom: "20px" }}>
                <input
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    border: "none",
                    borderBottom: field.error ? "1px solid #d32f2f" : "1px solid #ccc",
                    fontSize: "16px",
                    outline: "none",
                    backgroundColor: "rgba(214, 226, 214, 0.8)",
                    borderRadius: "4px",
                    ':focus': {
                      borderBottom: field.error ? "1px solid #d32f2f" : "2px solid rgb(20, 131, 75)",
                      backgroundColor: "rgba(255,255,255,0.95)"
                    }
                  }}
                />
                {field.error && (
                  <p style={{ color: "#d32f2f", fontSize: "12px", margin: "5px 0 0 5px" }}>
                    {field.error}
                  </p>
                )}
              </div>
            ))}
            
            <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
              <button
                type="submit"
                style={{
                  backgroundColor: isSubmitted ? "rgba(41, 45, 41, 0.8)" : "#001A00",
                  color: "white",
                  border: "none",
                  borderRadius: "25px",
                  padding: "12px 50px",
                  fontSize: "16px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  width: isMobile ? "100%" : "auto",
                  fontWeight: 500,
                  ':hover': {
                    backgroundColor: "#3a5a4c",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                  }
                }}
                disabled={isSubmitted}
              >
                {isSubmitted ? "Sending..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ContactUs;