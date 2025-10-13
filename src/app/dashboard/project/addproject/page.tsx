'use client';
import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
// import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
// import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
// import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Typography } from '@mui/material';
import { useUser } from '@/hooks/use-user';
export default function Page() {
  const router = useRouter();
  const { checkSession } = useUser();
  const [formData, setFormData] = React.useState({
    projectName: '',
    city: '',
    businessCategory: '',
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  let projects = JSON.parse(localStorage.getItem("projects") || "[]");
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const user = localStorage.getItem('user');

      if (!token || !user) {
        toast.error('You must be logged in to create a project');
        return;
      }

      const parsedUser = JSON.parse(user);
      const email = parsedUser.email;
      const projectId = uuidv4();

      const payload = {
        vendorId: email, // your backend expects vendorId as email
        projectId,
        ...formData,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        // If token is expired or other server error
        if (result?.msg === 'Token Expired. Please log in again.') {
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('auth-token');
          await checkSession?.();
          router.refresh();
        } else {
          toast.error(result?.msg || 'Failed to create project');
        }
        return;
      }
      projects.push({
        projectCategory: formData?.businessCategory,
        vendorId: email,
        projectId: projectId // store unique id
      });
      localStorage.setItem("projects", JSON.stringify(projects));
      toast.success('Project created successfully!');
      setFormData({
        projectName: '',
        city: '',
        businessCategory: '',
      });
      router.push('/dashboard/project');
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong');
    }
  };
  const handleBack = () => {
    window.history.back();
  };

  return (
    <Card>
      <div style={{ padding: 20, display: "flex", alignItems: "center" }}>
        <Button variant="outlined" onClick={handleBack}>
          Back to Projects
        </Button>
        <Typography variant="h6" style={{ margin: "auto" }}>
          Add Project
        </Typography>
      </div>

      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          <Grid
            size={{
              md: 6,
              xs: 12,
            }}
          >
            <FormControl fullWidth required>
              <InputLabel>Project Name</InputLabel>
              <OutlinedInput value={formData.projectName} onChange={handleChange} label="Project Name" name="projectName" />
            </FormControl>
          </Grid>
          <Grid
            size={{
              md: 6,
              xs: 12,
            }}
          >
            <FormControl fullWidth required>
              <InputLabel>City</InputLabel>
              <OutlinedInput value={formData.city} onChange={handleChange} label="City" name="city" />
            </FormControl>
          </Grid>
          <Grid
            size={{
              md: 6,
              xs: 12,
            }}
          >
            <FormControl fullWidth required>
              <InputLabel>Bussiness Category</InputLabel>
              <OutlinedInput value={formData.businessCategory} onChange={handleChange} label="Bussiness Category" name="businessCategory" />
            </FormControl>
          </Grid>
          <Grid
            size={{
              md: 6,
              xs: 12,
            }}
          >

          </Grid>


        </Grid>
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button onClick={handleSubmit} variant="contained">Save details</Button>
      </CardActions>
    </Card>
  );
}
