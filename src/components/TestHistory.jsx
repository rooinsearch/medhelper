import React, { useState, useEffect } from "react";
import {
  Box, Grid, Card, CardContent, Typography, Chip, Button, Modal,
  Avatar, Stack, Paper, CircularProgress
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { format } from "date-fns";
import api from "../api/axios";

const colors = { accent:"#4caf50", bg:"white" };
const statusColor = { pending:"info", processing:"warning", completed:"success", rejected:"error" };

const CardBox = ({ children, ...props }) => (
  <Card
    {...props}
    elevation={3}
    sx={{
      borderRadius:3,
      borderLeft:`6px solid ${colors.accent}`,
      transition:"transform .25s",
      "&:hover":{ transform:"translateY(-4px)", boxShadow:6 }
    }}
  >
    {children}
  </Card>
);

const DetailModal = ({ open, onClose, rec }) => {
  if (!rec) return null;
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position:"absolute", top:"50%", left:"50%", transform:"translate(-50%, -50%)",
        bgcolor:"background.paper", p:3, borderRadius:3, boxShadow:8, width:"90%", maxWidth:380
      }}>
        <Stack spacing={1.5}>
          <Typography variant="h6" fontWeight={700}>{rec.analysis.title}</Typography>
          <Typography variant="body2" color="text.secondary">{rec.hospital?.name||"-"}</Typography>
          <Typography><strong>Date:</strong> {format(new Date(rec.test_date),"dd MMM yyyy")}</Typography>
          <Typography><strong>Notes:</strong> {rec.notes||"-"}</Typography>
          <Typography><strong>Result:</strong> {rec.result||"-"}</Typography>
          <Typography><strong>Status:</strong>{" "}
            <Chip label={rec.status} color={statusColor[rec.status]} size="small"/>
          </Typography>
          <Typography><strong>Reviewed:</strong> {rec.reviewed_at ? new Date(rec.reviewed_at).toLocaleString() : "-"}</Typography>
          <Box textAlign="right"><Button variant="contained" onClick={onClose}>Close</Button></Box>
        </Stack>
      </Box>
    </Modal>
  );
};

const TestHistoryPage = () => {
  const [recs,setRecs] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null);
  const [sel,setSel] = useState(null);

  useEffect(()=>{
    (async()=>{
      try{
        const { data } = await api.get("/analysis/records/");
        const list = Array.isArray(data)?data:Array.isArray(data.results)?data.results:Array.isArray(data.data)?data.data:[];
        setRecs(list);
        setError(null);
      }catch(e){ console.error(e); setError("Failed to load records"); }
      finally{ setLoading(false); }
    })();
  },[]);

  if(loading) return <Box sx={{display:"flex",justifyContent:"center",mt:8}}><CircularProgress/></Box>;
  if(error)   return <Box sx={{p:3,textAlign:"center"}}><Typography color="error">{error}</Typography></Box>;

  return (
    <Box sx={{p:3,bgcolor:colors.bg,minHeight:"100vh"}}>
      <Typography variant="h4" fontWeight={700} mb={3}>Test History & Results</Typography>

      {recs.length===0 ? (
        <Paper sx={{p:3,textAlign:"center",borderLeft:`6px solid ${colors.accent}`}}>No records</Paper>
      ):(
        <Grid container spacing={3}>
          {recs.map(r=>(
            <Grid item xs={12} sm={6} md={4} key={r.id}>
              <CardBox onClick={()=>setSel(r)}>
                <CardContent sx={{p:2}}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{bgcolor:colors.accent}}><AssignmentIcon/></Avatar>
                      <Typography fontWeight={600}>{r.analysis.title}</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(r.test_date),"dd MMM yyyy")}
                    </Typography>
                    <Chip label={r.status} color={statusColor[r.status]} size="small" sx={{textTransform:"capitalize"}}/>
                  </Stack>
                </CardContent>
              </CardBox>
            </Grid>
          ))}
        </Grid>
      )}

      <DetailModal open={Boolean(sel)} onClose={()=>setSel(null)} rec={sel}/>
    </Box>
  );
};
export default TestHistoryPage;