import React, { useState } from "react";
import {
  Box,
  TextField,
  Switch,
  MenuItem,
  Select,
  Avatar,
  FormControl,
  InputLabel,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Grid,
  InputAdornment,
  Chip,
  Stack,
} from "@mui/material";
import {
  VisibilityOff,
  Edit as EditIcon,
  Cancel as CancelIcon,
  CheckCircle as SaveIcon,
} from "@mui/icons-material";

/* зелёная палитра проекта */
const color = {
  main: "#1a5f1a",
  light: "#4a8c4a",
  dark: "#003600",
};

/* ---------- общий заголовок секции ---------- */
const SectionHeader = ({ title, onEdit, isEditing }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      mb: 2,
    }}
  >
    <Typography
      variant="subtitle1"
      fontWeight={600}
      sx={{ borderLeft: `6px solid ${color.light}`, pl: 1 }}
    >
      {title}
    </Typography>

    <IconButton onClick={onEdit} size="small">
      {isEditing ? <CancelIcon color="error" /> : <EditIcon sx={{ color: color.main }} />}
    </IconButton>
  </Box>
);

/* ---------- основной компонент ---------- */
const ProfileSettings = () => {
  const [editMode, setEditMode] = useState({
    personal: false,
    security: false,
    notifications: false,
  });

  const [formData, setFormData] = useState({
    name: "John",
    surname: "Doe",
    email: "john.doe@example.com",
    phone: "+7 777 777 77 77",
    password: "Password123!",
    notifications: true,
    language: "english",
  });

  const toggleEdit = (section) =>
    setEditMode((prev) => ({ ...prev, [section]: !prev[section] }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* ---------- Personal info ---------- */}
      <Box mb={4}>
        <SectionHeader
          title="Personal Information"
          onEdit={() => toggleEdit("personal")}
          isEditing={editMode.personal}
        />

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                fontSize: "2.5rem",
                bgcolor: color.light,
                color: "#fff",
              }}
            >
              {formData.name[0]}
              {formData.surname[0]}
            </Avatar>
          </Grid>

          <Grid item xs={12} md={9}>
            <Grid container spacing={2}>
              {[
                { label: "Name", name: "name" },
                { label: "Surname", name: "surname" },
                { label: "Email", name: "email" },
                { label: "Phone", name: "phone" },
              ].map((f) => (
                <Grid item xs={12} sm={6} key={f.name}>
                  <TextField
                    label={f.label}
                    name={f.name}
                    value={formData[f.name]}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editMode.personal}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* ---------- Security ---------- */}
      <Box mb={4}>
        <SectionHeader
          title="Security"
          onEdit={() => toggleEdit("security")}
          isEditing={editMode.security}
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          fullWidth
          disabled={!editMode.security}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end" disabled>
                  <VisibilityOff />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {editMode.security && (
          <Stack direction="row" spacing={1} mt={2}>
            <Chip
              icon={<SaveIcon />}
              label="Save"
              color="success"
              clickable
              onClick={() => toggleEdit("security")}
            />
            <Chip
              icon={<CancelIcon />}
              label="Cancel"
              color="error"
              clickable
              onClick={() => toggleEdit("security")}
            />
          </Stack>
        )}
      </Box>

      {/* ---------- Notifications ---------- */}
      <Box>
        <SectionHeader
          title="Notifications & Preferences"
          onEdit={() => toggleEdit("notifications")}
          isEditing={editMode.notifications}
        />

        <List dense disablePadding>
          <ListItem
            secondaryAction={
              <Switch
                edge="end"
                checked={formData.notifications}
                onChange={() =>
                  setFormData((p) => ({ ...p, notifications: !p.notifications }))
                }
                disabled={!editMode.notifications}
              />
            }
          >
            <ListItemText primary="Email notifications" />
          </ListItem>

          <ListItem>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={formData.language}
                name="language"
                label="Language"
                onChange={handleChange}
                disabled={!editMode.notifications}
              >
                <MenuItem value="english">English</MenuItem>
                <MenuItem value="russian">Russian</MenuItem>
                <MenuItem value="kazakh">Kazakh</MenuItem>
              </Select>
            </FormControl>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default ProfileSettings;
