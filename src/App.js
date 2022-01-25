import {
	AppBar,
	Box,
  Button,
	Container,
	IconButton,
	Menu,
	MenuItem,
	Toolbar,
	Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu"
import { useState } from "react";
import { Routes, Route } from "react-router";
import { useNavigate } from "react-router-dom";
import "./App.css";
import Footer from "./client/components/Footer"
import NotFound from "./client/components/NotFound";
import Stretch from "./client/components/Stretch";
// import Train from "./client/components/Train";

const logo = "Stretch.AI"
const pages = ["Stretch", "Train"];

const App = () => {
	const [anchorElNav, setAnchorElNav] = useState(null);
  const navigate = useNavigate();

	const handleOpenNavMenu = (e) => {
    e.preventDefault();
		setAnchorElNav(e.currentTarget);
    console.log('🧑🏻‍💻 open', );
	};

	const handleCloseNavMenu = (e) => {
    e.preventDefault();
		setAnchorElNav(null);
    const toPage = e.target.innerText.toLowerCase();
    navigate(`/${toPage}`)
	};

	return (
		<div className="App">
			<AppBar position="static">
				<Container maxWidth="xl">
					<Toolbar disableGutters>
						<Typography
							variant="h6"
							noWrap
							component="div"
							sx={{ mr: 2, display: { xs: "none", md: "flex" } }}
						>
							{logo}
						</Typography>

						<Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
							<IconButton
								size="large"
								aria-label="account of current user"
								aria-controls="menu-appbar"
								aria-haspopup="true"
								onClick={handleOpenNavMenu}
								color="inherit"
							>
								<MenuIcon />
							</IconButton>
							<Menu
								id="menu-appbar"
								anchorEl={anchorElNav}
								anchorOrigin={{
									vertical: "bottom",
									horizontal: "left",
								}}
								keepMounted
								transformOrigin={{
									vertical: "top",
									horizontal: "left",
								}}
								open={Boolean(anchorElNav)}
								onClose={handleCloseNavMenu}
								sx={{
									display: { xs: "block", md: "none" },
								}}
							>
								{pages.map((page) => (
									<MenuItem key={page} onClick={handleCloseNavMenu}>
										<Typography textAlign="center">{page}</Typography>
									</MenuItem>
								))}
							</Menu>
						</Box>
						<Typography
							variant="h6"
							noWrap
							component="div"
							sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}
						>
							{logo}
						</Typography>
						<Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
							{pages.map((page) => (
								<Button
									key={page}
									onClick={handleCloseNavMenu}
									sx={{ my: 2, color: "white", display: "block" }}
								>
									{page}
								</Button>
							))}
						</Box>
					</Toolbar>
				</Container>
			</AppBar>
			<Routes>
				<Route path="/" element={<Stretch />} />
        <Route path="/stretch" element={<Stretch />} />
				{/* <Route path="/train" element={<Train />} /> */}
				<Route path="*" element={<NotFound />} />
			</Routes>
      <Footer />
		</div>
	);
};

export default App;
