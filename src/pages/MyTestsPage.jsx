import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import {
  Box, Typography, Card, CardHeader, CardContent, Chip, Stack, IconButton, Collapse,
  Avatar, Divider, useTheme, TableContainer, Table, TableHead, TableRow, TableCell,
  TableBody, TablePagination, Paper, CircularProgress, GlobalStyles, styled
} from "@mui/material";
import { ExpandMore, ExpandLess, ShoppingBag, ArrowBack } from "@mui/icons-material";

const BG = { background: "#f8f9fa" };
const statusColor = { pending:"default", processing:"warning", completed:"success", rejected:"error" };
const currency = new Intl.NumberFormat(undefined,{ style:"currency", currency:"KZT", maximumFractionDigits:0 });

const HeadCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  background: theme.palette.grey[100]
}));

const MyTestsPage = () => {
  const theme = useTheme();
  const nav   = useNavigate();
  const loc   = useLocation();

  const [records,setRecords]  = useState([]);
  const [fresh,setFresh]      = useState([]);
  const [openFresh,setOpen]   = useState(true);
  const [loading,setLoading]  = useState(true);
  const [error,setError]      = useState(null);

  const [page,setPage] = useState(0);
  const [rows,setRows] = useState(5);

  /* fetch */
  useEffect(()=>{
    (async()=>{
      try{
        setLoading(true);
        const { data } = await api.get("/analysis/records/");
        const list = Array.isArray(data)?data:Array.isArray(data.results)?data.results:Array.isArray(data.data)?data.data:[];
        setRecords(list);
        setFresh(Array.isArray(loc.state?.newRecords)?loc.state.newRecords:list.slice(0,2));
        setError(null);
      }catch(e){
        console.error(e);
        setError("Failed to load test records");
      }finally{ setLoading(false); }
    })();
  },[loc.state]);

  /* loading / error */
  if(loading)
    return <Box sx={{display:"flex",justifyContent:"center",alignItems:"center",height:"60vh"}}><CircularProgress/></Box>;
  if(error)
    return <Box sx={{p:4,textAlign:"center"}}><Typography color="error">{error}</Typography></Box>;

  return (
    <>
      <GlobalStyles styles={{body:{backgroundColor:BG.background}}}/>
      <Box sx={{maxWidth:1400,mx:"auto",p:{xs:2,md:6}}}>

        {/* header */}
        <Stack direction="row" spacing={1} alignItems="center" mb={4}>
          <IconButton onClick={()=>nav(-1)}><ArrowBack/></IconButton>
          <Avatar sx={{bgcolor:theme.palette.success.main}}><ShoppingBag/></Avatar>
          <Typography variant="h4" fontWeight={700}>My Medical Tests</Typography>
        </Stack>

        {/* recent */}
        {fresh.length>0 && (
          <Card elevation={3} sx={{mb:5,borderRadius:3,borderLeft:`6px solid ${theme.palette.success.main}`}}>
            <CardHeader
              title={`Recent Tests (${fresh.length})`}
              titleTypographyProps={{fontWeight:600}}
              sx={{bgcolor:theme.palette.success.light,cursor:"pointer"}}
              onClick={()=>setOpen(o=>!o)}
              action={<IconButton>{openFresh?<ExpandLess/>:<ExpandMore/>}</IconButton>}
            />
            <Collapse in={openFresh}>
              <CardContent>
                <Stack spacing={2} divider={<Divider flexItem/>}>
                  {fresh.map(r=>(
                    <Stack key={r.id} direction={{xs:"column",sm:"row"}} spacing={1} alignItems="center">
                      <Typography flex={1} fontWeight={500}>{r.analysis.title}</Typography>
                      <Typography fontWeight={600}>{currency.format(r.analysis.price)}</Typography>
                      <Chip label={r.status} color={statusColor[r.status]} size="small" sx={{minWidth:96}}/>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Collapse>
          </Card>
        )}

        {/* table */}
        <Paper elevation={2} sx={{borderRadius:3}}>
          <TableContainer>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {["Test","Hospital","Date","Notes","Result","Status","Reviewed at"].map(h=>(
                    <HeadCell key={h} align={["Notes","Result"].includes(h)?"left":"center"}>{h}</HeadCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {records.slice(page*rows,page*rows+rows).map(r=>(
                  <TableRow key={r.id} hover>
                    <TableCell>{r.analysis.title}</TableCell>
                    <TableCell align="center">{r.hospital?.name||"-"}</TableCell>
                    <TableCell align="center">{new Date(r.test_date).toLocaleDateString()}</TableCell>
                    <TableCell>{r.notes||"-"}</TableCell>
                    <TableCell>{r.result||"-"}</TableCell>
                    <TableCell align="center">
                      <Chip label={r.status} color={statusColor[r.status]} size="small"/>
                    </TableCell>
                    <TableCell align="center">
                      {r.reviewed_at ? new Date(r.reviewed_at).toLocaleString() : "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {records.length===0 && (
                  <TableRow><TableCell colSpan={7} align="center">No records</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div" rowsPerPageOptions={[5,10,25]}
            count={records.length} rowsPerPage={rows} page={page}
            onPageChange={(_,p)=>setPage(p)}
            onRowsPerPageChange={e=>{setRows(+e.target.value);setPage(0);}}
          />
        </Paper>
      </Box>
    </>
  );
};
export default MyTestsPage;
